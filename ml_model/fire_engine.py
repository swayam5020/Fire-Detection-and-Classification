"""
fire_engine.py - Dual-Track Decoupled Fire Engine
Smart India Hackathon (SIH 2026)
Combines ANN Classifier + Deterministic Geospatial Risk Engine
"""

import os
import joblib
import numpy as np
import pandas as pd
import tensorflow as tf

class FireAnalysisEngine:
    def __init__(self, artifacts_dir='.'):
        """Loads all AI models, scalers, and config files once upon initialization."""
        self.model = tf.keras.models.load_model(os.path.join(artifacts_dir, 'sih_ann_classifier.keras'))
        self.scaler = joblib.load(os.path.join(artifacts_dir, 'sih_scaler.pkl'))
        self.label_encoder = joblib.load(os.path.join(artifacts_dir, 'sih_label_encoder.pkl'))
        self.expected_features = joblib.load(os.path.join(artifacts_dir, 'ann_features.pkl'))
        
        # Risk Engine Thresholds (Percentile & Proximity Anchors)
        self.frp_high = 9.1      
        self.frp_critical = 20.6  
        self.persistence_high = 58.4   
        self.persistence_critical = 63.0
        self.spatial_spread_high = 1.1 
        self.spatial_spread_critical = 2.7
        self.danger_zone_km = 5.0             
        self.critical_capacity_mw = 500.0     
        self.population_exposure_pct = 20.0   

    def _evaluate_risk(self, event_dict):
        score = 0
        reasons = []
        
        max_frp = event_dict.get('max_frp', 0.0)
        if max_frp >= self.frp_critical:
            score += 30
            reasons.append("Critical thermal intensity")
        elif max_frp >= self.frp_high:
            score += 15
            
        persistence = event_dict.get('persistence_score', 0.0)
        if persistence >= self.persistence_critical:
            score += 20
            reasons.append("Critically persistent anomaly")
        elif persistence >= self.persistence_high:
            score += 10
            
        spread = event_dict.get('spatial_spread_km', 0.0)
        if spread >= self.spatial_spread_critical:
            score += 20
            reasons.append("Massive geographic spread")
        elif spread >= self.spatial_spread_high:
            score += 10

        distance = event_dict.get('nearest_industrial_distance_km', 999.0)
        capacity = event_dict.get('nearby_industrial_capacity_mw', 0.0)
        
        if distance <= self.danger_zone_km:
            score += 30
            reasons.append(f"HAZARD: Fire detected {distance:.1f}km from industrial facility")
            if capacity >= self.critical_capacity_mw:
                score += 20
                reasons.append(f"SEVERE HAZARD: Proximity to major infrastructure ({capacity:.0f} MW capacity)")
                
        built_up = event_dict.get('built_up_percentage', 0.0)
        if built_up >= self.population_exposure_pct:
            score += 25
            reasons.append(f"POPULATION RISK: High built-up area ({built_up:.1f}%)")
            
        if score >= 100:
            level = "DISASTER / SEVERE EMERGENCY"
        elif score >= 75:
            level = "CRITICAL"
        elif score >= 50:
            level = "HIGH"
        elif score >= 25:
            level = "MEDIUM"
        else:
            level = "LOW"
            if not reasons:
                reasons.append("Standard baseline event")
            
        return {
            "risk_score": min(score, 150),
            "risk_level": level,
            "risk_reasons": reasons
        }

    def analyze_batch(self, raw_fire_dicts):
        """
        Vectorized form of analyze() for many events at once: one scaler
        transform and one model forward pass instead of N of each. Used by
        the API's per-request endpoints, which otherwise re-run the ANN once
        per cluster row on every request.
        """
        if not raw_fire_dicts:
            return []

        input_df = pd.DataFrame(raw_fire_dicts)[self.expected_features]
        input_scaled = self.scaler.transform(input_df)
        probs = self.model.predict(input_scaled, verbose=0)

        predicted_idx = np.argmax(probs, axis=1)
        predicted_types = self.label_encoder.inverse_transform(predicted_idx)
        confidences = np.max(probs, axis=1) * 100

        results = []
        for i, raw in enumerate(raw_fire_dicts):
            risk_output = self._evaluate_risk(raw)
            class_prob_map = {
                cls_name: round(float(probs[i][j]), 4) for j, cls_name in enumerate(self.label_encoder.classes_)
            }
            results.append({
                "fire_type": predicted_types[i],
                "probability": round(float(confidences[i]), 2),
                "all_class_probabilities": class_prob_map,
                "risk_score": risk_output["risk_score"],
                "risk_level": risk_output["risk_level"],
                "risk_reason": risk_output["risk_reasons"],
            })
        return results

    def analyze(self, raw_fire_dict):
        """Generates: fire type, probability, risk score, risk level, and risk reasons."""
        # 1. Deterministic Risk Evaluation (Uses raw physical metrics)
        risk_output = self._evaluate_risk(raw_fire_dict)
        
        # 2. ANN Classification (Isolates 26 features; safely ignores lat/lon/cluster_id)
        input_df = pd.DataFrame([raw_fire_dict])[self.expected_features]
        input_scaled = self.scaler.transform(input_df)
        
        probs = self.model.predict(input_scaled, verbose=0)[0]
        predicted_idx = int(np.argmax(probs))
        predicted_type = self.label_encoder.inverse_transform([predicted_idx])[0]
        confidence = float(np.max(probs) * 100)
        
        # Class distribution map
        class_prob_map = {
            cls_name: round(float(probs[i]), 4)
            for i, cls_name in enumerate(self.label_encoder.classes_)
        }
        
        return {
            "fire_type": predicted_type,
            "probability": round(confidence, 2),
            "all_class_probabilities": class_prob_map,
            "risk_score": risk_output["risk_score"],
            "risk_level": risk_output["risk_level"],
            "risk_reason": risk_output["risk_reasons"]
        }
