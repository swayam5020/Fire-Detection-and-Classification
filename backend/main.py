from fastapi import FastAPI
import psycopg2
from fastapi.middleware.cors import CORSMiddleware

# FastAPI app initialize karna
app = FastAPI(title="NTRO Thermal Anomaly API - SIH'26")

# CORS setup (Taaki Sujal ka Frontend API ko call kar sake)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Abhi ke liye sab allow kar rahe hain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection settings
DB_CONFIG = {
    "dbname": "sih26_ntro_db",
    "user": "postgres",
    "password": "Suryanshdev@191", # YAHAN APNA PASSWORD DAALNA
    "host": "localhost",
    "port": "5432"
}

@app.get("/")
def home():
    return {"message": "Welcome to SIH'26 Backend API. Developed by Suri!"}

@app.get("/api/v1/fires")
def get_all_fires():
    try:
        # Database se connect karna
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        # Dummy data fetch karna
        cur.execute("SELECT event_id, latitude, longitude, frp, confidence FROM firms_raw_data;")
        rows = cur.fetchall()
        
        # Data ko JSON (Dictionary) format mein convert karna
        fires_data = []
        for row in rows:
            fires_data.append({
    "type": "Feature",
    "geometry": {
        "type": "Point",
        "coordinates": [float(row[2]), float(row[1])] # Dhyan rakhna: GeoJSON mein longitude pehle aata hai
    },
    "properties": {
        "event_id": row[0],
        "frp": float(row[3]),
        "confidence": row[4]
    }
})
            
        cur.close()
        conn.close()
        
        return {"type": "FeatureCollection", "features": fires_data}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}