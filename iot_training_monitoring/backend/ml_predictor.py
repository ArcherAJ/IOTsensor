import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from database import db
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import warnings
warnings.filterwarnings('ignore')

class MLPredictor:
    def __init__(self):
        self.db = db
        self.scaler = StandardScaler()
        self.models = {}
        self._train_models()
    
    def _train_models(self):
        """Train ML models for predictive maintenance"""
        try:
            sensor_df = self.db.get_sensor_data()
            equipment_df = self.db.get_equipment()
            
            if sensor_df.empty or equipment_df.empty:
                print("No data available for model training")
                return
            
            # Prepare features for machine learning
            features = ['temperature', 'vibration', 'power_consumption', 'usage_hours']
            additional_features = ['humidity', 'pressure', 'rpm', 'efficiency', 'oil_level', 'noise_level']
            
            for feature in additional_features:
                if feature in sensor_df.columns:
                    features.append(feature)
            
            # Create failure labels based on equipment status
            equipment_status_map = {'Active': 0, 'Warning': 1, 'Critical': 2}
            sensor_df['failure_risk'] = sensor_df['equipment_id'].map(
                equipment_df.set_index('id')['status'].map(equipment_status_map)
            )
            
            # Train Random Forest for failure prediction
            X = sensor_df[features].fillna(0)
            y = sensor_df['failure_risk'].fillna(0)  # Fill NaN values in target variable
            
            # Remove rows where target is still NaN after filling
            valid_indices = ~y.isna()
            X = X[valid_indices]
            y = y[valid_indices]
            
            if len(X) > 10:  # Need minimum data for training
                X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
                
                self.models['failure_predictor'] = RandomForestClassifier(n_estimators=50, random_state=42)
                self.models['failure_predictor'].fit(X_train, y_train)
                
                # Train Isolation Forest for anomaly detection
                self.models['anomaly_detector'] = IsolationForest(contamination=0.1, random_state=42)
                self.models['anomaly_detector'].fit(X_train)
                
                print(f"Models trained successfully with {len(X)} samples")
            else:
                print(f"Insufficient data for training: {len(X)} samples")
                
        except Exception as e:
            print(f"Error training models: {e}")
            # Initialize empty models to prevent errors
            self.models = {}
    
    def predict_maintenance(self, equipment_id):
        """
        Enhanced predictive maintenance algorithm using ML models
        """
        sensor_df = self.db.get_sensor_data()
        equipment_df = self.db.get_equipment()
        
        if sensor_df.empty:
            return {"prediction": "No data available", "confidence": 0.0}
        
        equipment_data = sensor_df[sensor_df['equipment_id'] == equipment_id]
        
        if equipment_data.empty:
            return {"prediction": "No data available", "confidence": 0.0}
        
        # Get latest sensor reading
        latest_data = equipment_data.iloc[-1]
        
        # Traditional rule-based prediction
        risk_score = 0.0
        factors = []
        
        # Temperature factor
        if latest_data['temperature'] > 60:
            risk_score += 0.4
            factors.append("High temperature")
        elif latest_data['temperature'] > 50:
            risk_score += 0.2
            factors.append("Elevated temperature")
        
        # Vibration factor
        if latest_data['vibration'] > 0.3:
            risk_score += 0.4
            factors.append("High vibration")
        elif latest_data['vibration'] > 0.2:
            risk_score += 0.2
            factors.append("Elevated vibration")
        
        # Usage hours factor
        if latest_data['usage_hours'] > 2000:
            risk_score += 0.3
            factors.append("High usage hours")
        elif latest_data['usage_hours'] > 1500:
            risk_score += 0.15
            factors.append("Moderate usage hours")
        
        # ML-based prediction if model is available
        ml_prediction = None
        ml_confidence = 0.0
        
        if 'failure_predictor' in self.models:
            try:
                features = ['temperature', 'vibration', 'power_consumption', 'usage_hours']
                feature_values = []
                for feature in features:
                    if feature in latest_data:
                        feature_values.append(latest_data[feature])
                    else:
                        feature_values.append(0)
                
                # Add additional features if available
                additional_features = ['humidity', 'pressure', 'rpm', 'efficiency', 'oil_level', 'noise_level']
                for feature in additional_features:
                    if feature in latest_data:
                        feature_values.append(latest_data[feature])
                    else:
                        feature_values.append(0)
                
                # Make prediction
                prediction_proba = self.models['failure_predictor'].predict_proba([feature_values])[0]
                ml_prediction = np.argmax(prediction_proba)
                ml_confidence = np.max(prediction_proba)
                
                # Convert ML prediction to risk score
                ml_risk_score = ml_prediction / 2.0  # Scale 0-2 to 0-1
                risk_score = (risk_score + ml_risk_score) / 2  # Average with rule-based
                
            except Exception as e:
                print(f"ML prediction error: {e}")
        
        # Determine final prediction
        if risk_score >= 0.7:
            prediction = "Immediate maintenance required"
            confidence = min(risk_score, 0.95)
        elif risk_score >= 0.4:
            prediction = "Maintenance recommended within 7 days"
            confidence = risk_score
        elif risk_score >= 0.2:
            prediction = "Routine check recommended"
            confidence = risk_score
        else:
            prediction = "No maintenance needed"
            confidence = 1.0 - risk_score
        
        return {
            "equipment_id": equipment_id,
            "prediction": prediction,
            "confidence": round(confidence, 2),
            "risk_score": round(risk_score, 2),
            "factors": factors,
            "ml_prediction": ml_prediction,
            "ml_confidence": round(ml_confidence, 2),
            "timestamp": datetime.now().isoformat()
        }
    
    def predict_equipment_failure(self, equipment_id, days_ahead=30):
        """
        Enhanced failure prediction with ML models
        """
        prediction = self.predict_maintenance(equipment_id)
        
        # Convert risk score to failure probability
        risk_score = prediction['risk_score']
        failure_probability = min(risk_score * 0.8, 0.95)  # Scale risk to probability
        
        # Calculate predicted failure date
        predicted_date = datetime.now() + timedelta(days=days_ahead * risk_score)
        
        # Estimate maintenance cost
        equipment_df = self.db.get_equipment()
        equipment = equipment_df[equipment_df['id'] == equipment_id]
        estimated_cost = 0
        if not equipment.empty and 'maintenance_cost' in equipment.columns:
            estimated_cost = equipment.iloc[0]['maintenance_cost'] or 0
        
        return {
            "equipment_id": equipment_id,
            "failure_probability": round(failure_probability, 2),
            "prediction_horizon_days": days_ahead,
            "predicted_failure_date": predicted_date.strftime('%Y-%m-%d'),
            "recommendation": prediction['prediction'],
            "estimated_cost": estimated_cost,
            "confidence": prediction['confidence'],
            "timestamp": datetime.now().isoformat()
        }
    
    def detect_anomalies(self, equipment_id=None):
        """
        Detect anomalies in equipment behavior using Isolation Forest
        """
        sensor_df = self.db.get_sensor_data()
        
        if sensor_df.empty or 'anomaly_detector' not in self.models:
            return {"anomalies": [], "message": "No anomaly detection model available"}
        
        anomalies = []
        
        try:
            # Prepare features
            features = ['temperature', 'vibration', 'power_consumption', 'usage_hours']
            additional_features = ['humidity', 'pressure', 'rpm', 'efficiency', 'oil_level', 'noise_level']
            all_features = features + additional_features
            
            if equipment_id:
                equipment_data = sensor_df[sensor_df['equipment_id'] == equipment_id]
            else:
                equipment_data = sensor_df
            
            for _, row in equipment_data.iterrows():
                feature_values = []
                for feature in all_features:
                    if feature in row:
                        feature_values.append(row[feature])
                    else:
                        feature_values.append(0)
                
                # Detect anomaly
                anomaly_score = self.models['anomaly_detector'].decision_function([feature_values])[0]
                is_anomaly = self.models['anomaly_detector'].predict([feature_values])[0] == -1
                
                if is_anomaly:
                    anomalies.append({
                        "equipment_id": row['equipment_id'],
                        "timestamp": row['timestamp'],
                        "anomaly_score": round(anomaly_score, 3),
                        "severity": "High" if anomaly_score < -0.5 else "Medium",
                        "features": {feature: row[feature] for feature in features if feature in row}
                    })
        
        except Exception as e:
            print(f"Anomaly detection error: {e}")
        
        return {
            "anomalies": anomalies,
            "total_anomalies": len(anomalies),
            "timestamp": datetime.now().isoformat()
        }
    
    def get_equipment_health_score(self, equipment_id):
        """
        Calculate overall health score for equipment
        """
        sensor_df = self.db.get_sensor_data()
        equipment_df = self.db.get_equipment()
        
        if sensor_df.empty:
            return {"health_score": 0, "status": "No data"}
        
        equipment_data = sensor_df[sensor_df['equipment_id'] == equipment_id]
        
        if equipment_data.empty:
            return {"health_score": 0, "status": "No data"}
        
        latest_data = equipment_data.iloc[-1]
        
        # Calculate health score based on multiple factors
        health_score = 100
        
        # Temperature factor (optimal: 30-50°C)
        temp = latest_data['temperature']
        if temp > 60:
            health_score -= 30
        elif temp > 50:
            health_score -= 15
        elif temp < 20:
            health_score -= 10
        
        # Vibration factor (optimal: <0.1)
        vibration = latest_data['vibration']
        if vibration > 0.3:
            health_score -= 25
        elif vibration > 0.2:
            health_score -= 10
        
        # Efficiency factor
        if 'efficiency' in latest_data:
            efficiency = latest_data['efficiency']
            if efficiency < 70:
                health_score -= 20
            elif efficiency < 80:
                health_score -= 10
        
        # Oil level factor
        if 'oil_level' in latest_data:
            oil_level = latest_data['oil_level']
            if oil_level < 30:
                health_score -= 25
            elif oil_level < 50:
                health_score -= 10
        
        # Usage hours factor
        usage_hours = latest_data['usage_hours']
        if usage_hours > 2000:
            health_score -= 15
        elif usage_hours > 1500:
            health_score -= 5
        
        health_score = max(0, min(100, health_score))
        
        # Determine status
        if health_score >= 90:
            status = "Excellent"
        elif health_score >= 75:
            status = "Good"
        elif health_score >= 60:
            status = "Fair"
        elif health_score >= 40:
            status = "Poor"
        else:
            status = "Critical"
        
        return {
            "equipment_id": equipment_id,
            "health_score": round(health_score, 1),
            "status": status,
            "timestamp": datetime.now().isoformat()
        }