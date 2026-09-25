# 🔥 AI-Based Fire Detection & Classification

### Team Pyron — SIH'26

An AI-powered system for detecting, classifying, and assessing the risk of industrial fires and persistent thermal anomalies using NASA FIRMS, satellite land-cover data, OpenStreetMap, and machine learning.

## 🚀 Pipeline

**NASA FIRMS → Cleaning → DBSCAN → Persistence → WorldCover → OSM → Industrial Proximity → ML Features → Classification → Risk Assessment**

## 🎯 What It Does

- Detects thermal anomalies using NASA FIRMS
- Cleans and validates incoming fire detections
- Groups detections using DBSCAN clustering
- Measures persistence and recurrence
- Enriches events with ESA WorldCover land-cover data
- Adds OpenStreetMap geospatial context
- Calculates proximity to industrial facilities
- Builds the final 30-attribute ML input
- Classifies events as **Industrial, Agricultural, or Wildfire**
- Generates prediction probabilities and risk assessment
- Stores processed data in PostgreSQL
- Provides API integration through FastAPI

## 📊 V4 Dataset

- **2,859 records**
- **30 attributes**
- Industrial, Agricultural & Wildfire classes
- Expanded industrial fire samples
- Environmental and industrial proximity features
- Prepared for model retraining

## ⚙️ Dynamic Processing

The live pipeline is designed to continuously process new NASA FIRMS detections through the complete feature-generation workflow and pass the resulting ML-ready data to the classification and risk-analysis system.

## 🛠️ Tech Stack

**Python · FastAPI · PostgreSQL · DBSCAN · NASA FIRMS · ESA WorldCover · OpenStreetMap · Machine Learning**

---

### Smart India Hackathon 2026 — Team Pyron
