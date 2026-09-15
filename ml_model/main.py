from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
import urllib.parse
import pandas as pd
import numpy as np
import joblib
import json
import os
import tensorflow as tf
import requests

app = FastAPI(title="SIH'26 Thermal Anomaly Risk API")

# 1. CORS Setup (SUJAL KE LIYE SABSE ZAROORI)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Hackathon ke liye '*' best hai, koi bhi frontend connect kar lega
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Connection Setup
my_password = "Suryanshdev@191"
encoded_password = urllib.parse.quote_plus(my_password)
DATABASE_URL = f'postgresql://postgres:{encoded_password}@localhost:5432/sih26_db'
engine = create_engine(DATABASE_URL)

# Global variables for AI assets
ann_model = None
scaler = None
label_encoder = None
feature_columns = None

@app.on_event("startup")
def load_ai_assets():
    global ann_model, scaler, label_encoder, feature_columns
    print("🚀 AI Models Load ho rahe hain...")
    try:
        ann_model = tf.keras.models.load_model("sih_ann_classifier.keras")
        scaler = joblib.load("sih_scaler.pkl")
        label_encoder = joblib.load("sih_label_encoder.pkl")
        feature_columns = joblib.load("ann_features.pkl")
        print("✅ AI Models Successfully Loaded!")
    except Exception as e:
        print(f"❌ Model load error: {e}")

@app.get("/")
def read_root():
    return {"message": "Welcome to SIH'26 Backend Engine!"}

# Yeh purana test endpoint chhod dete hain debug karne ke liye
@app.get("/run-test-case/{case_name}")
def run_test_case(case_name: str):
    # ... (tera purana run_test_case ka code yahan same rahega) ...
    pass

# 🚀 2. THE MAIN ENDPOINT FOR FRONTEND (MAPLIBRE) 🚀
@app.get("/api/thermal-map")
def get_thermal_map():
    try:
        # DB se data fetch karo
        query = "SELECT * FROM processed_data"
        df = pd.read_sql(query, engine)
        
        # Ab dataframe se required features nikal kar predict karo (Batch Prediction)
        # Note: Agar data zyada hai toh hackathon mein fast response ke liye DB ka fire_class use kar sakte ho.
        # Par hum full flex marenge aur live predict karenge!
        
        X = df[feature_columns]
        X_scaled = scaler.transform(X)
        predictions = ann_model.predict(X_scaled)
        
        class_indices = np.argmax(predictions, axis=1)
        confidences = np.max(predictions, axis=1)
        
        predicted_labels = label_encoder.inverse_transform(class_indices)
        
        # GeoJSON Structure banana
        features = []
        for i, row in df.iterrows():
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [row["centroid_lon"], row["centroid_lat"]]
                },
                "properties": {
                    "cluster_id": row["cluster_id"],
                    "ai_prediction": predicted_labels[i],
                    "confidence": round(float(confidences[i]) * 100, 2),
                    "persistence_score": row["persistence_score"],
                    "nearby_industry_mw": row["nearby_industrial_capacity_mw"],
                    # Risk engine ka basic calculation
                    "risk_level": "HIGH" if (predicted_labels[i] == "INDUSTRIAL" and float(confidences[i]) > 0.90) else "MEDIUM" if predicted_labels[i] == "INDUSTRIAL" else "LOW"
                }
            }
            features.append(feature)
            
        geojson_data = {
            "type": "FeatureCollection",
            "features": features
        }
        
        return geojson_data
        
    except Exception as e:
        return {"error": str(e)}


# 🚀 3. LIVE IOT SENSOR ENDPOINT (FIREBASE BRIDGE) 🚀
@app.get("/api/live-sensors")
def get_live_sensor_data():
    # Tere dost wala same Firebase Live URL
    firebase_url = "https://farmiq-c8afe-default-rtdb.asia-southeast1.firebasedatabase.app/Greenhouse/Live.json"
    
    try:
        # Firebase se data fetch karo
        response = requests.get(firebase_url)
        data = response.json()
        
        # Ground-level Fire Risk Logic (Custom for your project)
        temp = data.get("temperature", 0)
        co2 = data.get("co2Level", 0)
        
        # Agar temperature ya CO2 (smoke) normal se bahut zyada hai
        fire_alert = "DANGER: HIGH PROBABILITY OF FIRE" if (temp > 45.0 or co2 > 1500) else "SAFE"
        
        return {
            "status": "success",
            "source": "Wokwi ESP32 via Firebase",
            "sensor_readings": data,
            "on_ground_fire_alert": fire_alert
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}