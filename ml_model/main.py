"""
SIH'26 Thermal Anomaly Risk API — FastAPI service that fronts the
DBSCAN/OSM-join pipeline's `processed_data` table with the ANN classifier
and deterministic risk engine in fire_engine.py, and serves it to the
PYRON frontend.

No endpoint here invents data: every field either comes straight from the
database, is computed by fire_engine.py from real columns, or is explicitly
omitted (as null / an empty list) when nothing backs it. See README/memory
notes in the frontend repo for the specific fields that are not sourceable
from this pipeline (region names, detection timestamps, facility identity,
alert workflow state) — those stay null rather than being fabricated.
"""

import os
import json
from contextlib import asynccontextmanager
from pathlib import Path

import numpy as np
import pandas as pd
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
import urllib.parse

from fire_engine import FireAnalysisEngine

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

ARTIFACTS_DIR = Path(__file__).resolve().parent
load_dotenv(ARTIFACTS_DIR / ".env")

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "sih26_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_TABLE = os.getenv("DB_TABLE", "processed_data")

FIREBASE_LIVE_SENSOR_URL = os.getenv(
    "FIREBASE_LIVE_SENSOR_URL",
    "https://farmiq-c8afe-default-rtdb.asia-southeast1.firebasedatabase.app/Greenhouse/Live.json",
)

CORS_ALLOW_ORIGINS = [o.strip() for o in os.getenv("CORS_ALLOW_ORIGINS", "*").split(",")]

_encoded_password = urllib.parse.quote_plus(DB_PASSWORD)
DATABASE_URL = f"postgresql://{DB_USER}:{_encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
db_engine = create_engine(DATABASE_URL)

# Populated at startup; a load failure here means every data endpoint 503s
# with a clear message instead of the process crashing (or, previously,
# silently starting up broken and 500ing on the first request).
fire_engine: FireAnalysisEngine | None = None
fire_engine_error: str | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global fire_engine, fire_engine_error
    try:
        fire_engine = FireAnalysisEngine(artifacts_dir=str(ARTIFACTS_DIR))
        print("AI models loaded successfully.")
    except Exception as e:  # noqa: BLE001 — deliberately broad: any load failure must not crash startup
        fire_engine_error = str(e)
        print(f"Model load error: {fire_engine_error}")
    yield


app = FastAPI(title="SIH'26 Thermal Anomaly Risk API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def require_fire_engine() -> FireAnalysisEngine:
    if fire_engine is None:
        raise HTTPException(
            status_code=503,
            detail=f"AI models are not loaded: {fire_engine_error or 'unknown error'}",
        )
    return fire_engine


def load_clusters() -> pd.DataFrame:
    """Reads every row currently in the processed_data table."""
    try:
        return pd.read_sql(text(f"SELECT * FROM {DB_TABLE}"), db_engine)
    except Exception as e:  # noqa: BLE001 — surfaced to the caller as a 503, not a stack trace
        raise HTTPException(status_code=503, detail=f"Database query failed: {e}") from e


def analyze_clusters(df: pd.DataFrame, engine: FireAnalysisEngine) -> list[dict]:
    """
    Runs the ANN classifier + deterministic risk engine over every row in one
    batch (a single model forward pass, not one per row — see
    fire_engine.FireAnalysisEngine.analyze_batch) and returns one dict per
    cluster, keyed the way ThermalMapProperties (the frontend adapter)
    expects. Only real columns are read; nothing is invented for fields the
    pipeline doesn't produce.
    """
    raw_rows = df.to_dict(orient="records")
    try:
        analyses = engine.analyze_batch(raw_rows)
    except Exception as e:  # noqa: BLE001 — a malformed table must 503, not crash the process
        raise HTTPException(status_code=503, detail=f"Model inference failed: {e}") from e

    results = []
    for raw, analysis in zip(raw_rows, analyses):
        results.append(
            {
                "cluster_id": raw.get("cluster_id"),
                "centroid_lat": raw.get("centroid_lat"),
                "centroid_lon": raw.get("centroid_lon"),
                "ai_prediction": analysis["fire_type"],
                "confidence": analysis["probability"],
                "persistence_score": raw.get("persistence_score"),
                "nearby_industry_mw": raw.get("nearby_industrial_capacity_mw"),
                "risk_level": analysis["risk_level"],
                "risk_score": analysis["risk_score"],
                "risk_reason": analysis["risk_reason"],
                "max_frp": raw.get("max_frp"),
                "max_brightness": raw.get("max_brightness"),
                "nearest_industrial_distance_km": raw.get("nearest_industrial_distance_km"),
                "spatial_spread_km": raw.get("spatial_spread_km"),
                "detection_count": raw.get("detection_count"),
            }
        )
    return results


def cluster_to_feature(c: dict) -> dict:
    return {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [float(c["centroid_lon"]), float(c["centroid_lat"])],
        },
        "properties": {k: v for k, v in c.items() if k not in ("centroid_lat", "centroid_lon")},
    }


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@app.get("/")
def read_root():
    return {"message": "Welcome to SIH'26 Backend Engine!"}


@app.get("/health")
def health():
    """Cheap readiness probe: model status and DB reachability, no query cost."""
    db_ok = True
    db_error = None
    try:
        with db_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:  # noqa: BLE001
        db_ok = False
        db_error = str(e)

    return {
        "models_loaded": fire_engine is not None,
        "model_error": fire_engine_error,
        "database_reachable": db_ok,
        "database_error": db_error,
        "database": DB_NAME,
        "table": DB_TABLE,
    }


@app.get("/run-test-case/{case_name}")
def run_test_case(case_name: str):
    """
    Runs the AI engine against one of the fixtures in
    integration_test_cases.json — useful for exercising the model without a
    live database. Case names: CRITICAL_INDUSTRIAL_DISASTER,
    ROUTINE_AGRICULTURAL_BURN, DEEP_FOREST_WILDFIRE.
    """
    engine = require_fire_engine()
    cases_path = ARTIFACTS_DIR / "integration_test_cases.json"
    try:
        cases = json.loads(cases_path.read_text())
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="integration_test_cases.json not found")

    if case_name not in cases:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown case '{case_name}'. Available: {list(cases.keys())}",
        )

    return engine.analyze(cases[case_name])


# THE MAIN ENDPOINT FOR FRONTEND (MAPLIBRE)
@app.get("/api/thermal-map")
def get_thermal_map():
    engine = require_fire_engine()
    df = load_clusters()
    if df.empty:
        return {"type": "FeatureCollection", "features": []}

    clusters = analyze_clusters(df, engine)
    return {"type": "FeatureCollection", "features": [cluster_to_feature(c) for c in clusters]}


# LIVE IOT SENSOR ENDPOINT (FIREBASE BRIDGE)
@app.get("/api/live-sensors")
def get_live_sensor_data():
    try:
        response = requests.get(FIREBASE_LIVE_SENSOR_URL, timeout=5)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Firebase request failed: {e}") from e

    if not isinstance(data, dict):
        raise HTTPException(status_code=502, detail="Unexpected Firebase response shape")

    temp = data.get("temperature")
    co2 = data.get("co2Level")
    fire_alert = None
    if temp is not None or co2 is not None:
        fire_alert = "DANGER: HIGH PROBABILITY OF FIRE" if (
            (temp is not None and temp > 45.0) or (co2 is not None and co2 > 1500)
        ) else "SAFE"

    return {
        "status": "success",
        "source": "Wokwi ESP32 via Firebase",
        "sensor_readings": data,
        "on_ground_fire_alert": fire_alert,
    }


# ALERTS — derived from the same real cluster analysis as /api/thermal-map.
# There is no persisted alert/workflow store anywhere in this pipeline: no
# table tracks acknowledgement, no dispatch system assigns a team, no event
# log records history. Rather than invent that content, every field with no
# real source is sent as null / an empty list, and the frontend renders
# those as "—" / hidden, the same convention it already uses for ESP32
# readings and other backend-optional fields.
RISK_ORDER = {"critical": 4, "high": 3, "medium": 2, "low": 1}
ALERT_SEVERITY_FLOOR = "high"  # clusters at/above this level become alerts


@app.get("/api/alerts")
def get_alerts():
    engine = require_fire_engine()
    df = load_clusters()
    if df.empty:
        return []

    clusters = analyze_clusters(df, engine)
    floor = RISK_ORDER[ALERT_SEVERITY_FLOOR]
    alerts = []
    for c in clusters:
        level = c["risk_level"].lower()
        if RISK_ORDER.get(level, 0) < floor:
            continue

        reasons = c.get("risk_reason") or []
        cluster_id = c["cluster_id"]
        lat, lon = c["centroid_lat"], c["centroid_lon"]

        alerts.append(
            {
                "alert_id": f"SOS-{cluster_id}",
                "severity": level,
                # No region name is available anywhere in this pipeline —
                # coordinates are the real, non-fabricated location we have.
                "location": f"{lat:.4f}, {lon:.4f}",
                # No detection-time column exists in processed_data.
                "timestamp": None,
                "cluster_id": str(cluster_id),
                "reason": "; ".join(reasons) if reasons else f"{c['ai_prediction']} anomaly, risk score {c['risk_score']}/100",
                # No acknowledgement workflow is persisted anywhere, so every
                # alert this endpoint can see is, truthfully, still active.
                "status": "active",
                "automated_assessment": (
                    f"Classified as {c['ai_prediction']} ({c['confidence']:.1f}% model confidence). "
                    f"Risk score {c['risk_score']}/100 ({c['risk_level']})."
                ),
                "recommended_actions": None,
                "assigned_team": None,
                "assigned_team_status": None,
                "log_timeline": [],
            }
        )

    return alerts


@app.get("/api/alerts/notifications")
def get_alert_notifications():
    alerts = get_alerts()
    active = [a for a in alerts if a["status"] == "active"]
    return {"hasUnread": len(active) > 0, "unreadCount": len(active)}
