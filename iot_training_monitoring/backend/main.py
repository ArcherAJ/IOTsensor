from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import json
import asyncio
from datetime import datetime
from typing import List, Dict, Any
from functools import lru_cache
import time
from models import *
from models import SensorData, MaintenanceLog, Equipment, User, UserRole, GamificationStats, CommunityFeedback
from database import db
from data_processor import DataProcessor
from ml_predictor import MLPredictor
from ai_insights import ai_insights_engine
from gamification import gamification_engine
from ai_chatbot import ai_chatbot, notification_engine
from virtual_lab import virtual_lab_engine

app = FastAPI(title="IoT Training Equipment Monitoring API")

# Add performance middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Performance cache
performance_cache = {}
cache_ttl = 30  # 30 seconds TTL

# Initialize components
data_processor = DataProcessor()
ml_predictor = MLPredictor()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# Performance optimization functions
def get_cached_data(key: str):
    """Get data from cache if not expired"""
    if key in performance_cache:
        data, timestamp = performance_cache[key]
        if time.time() - timestamp < cache_ttl:
            return data
        else:
            del performance_cache[key]
    return None

def set_cached_data(key: str, data: Any):
    """Set data in cache with timestamp"""
    performance_cache[key] = (data, time.time())

@lru_cache(maxsize=100)
def get_equipment_data_cached():
    """Cached equipment data retrieval"""
    return db.get_equipment()

@lru_cache(maxsize=100)
def get_sensor_data_cached():
    """Cached sensor data retrieval"""
    return db.get_sensor_data()

# API Routes (must be defined before catch-all route)
@app.get("/api/overview")
async def get_overview():
    """Get overview statistics with caching"""
    cache_key = "overview_stats"
    cached_data = get_cached_data(cache_key)
    
    if cached_data:
        return cached_data
    
    stats = data_processor.get_overview_stats()
    set_cached_data(cache_key, stats)
    return stats

@app.get("/api/chart-data/performance")
async def get_performance_chart_data():
    """Get performance chart data"""
    sensor_df = db.get_sensor_data()
    if sensor_df.empty:
        return {"labels": [], "datasets": []}
    
    # Group by equipment and get latest efficiency
    latest_data = sensor_df.groupby('equipment_id').last().reset_index()
    equipment_df = db.get_equipment()
    
    labels = []
    efficiency_data = []
    
    for _, row in latest_data.iterrows():
        equipment = equipment_df[equipment_df['id'] == row['equipment_id']]
        if not equipment.empty:
            labels.append(equipment.iloc[0]['name'])
            efficiency_data.append(row['efficiency'])
    
    return {
        "labels": labels,
        "datasets": [{
            "label": "Efficiency (%)",
            "data": efficiency_data,
            "backgroundColor": "rgba(102, 126, 234, 0.8)",
            "borderColor": "rgba(102, 126, 234, 1)",
            "borderWidth": 2
        }]
    }

@app.get("/api/chart-data/energy")
async def get_energy_chart_data():
    """Get energy consumption chart data"""
    usage_df = db.get_usage_data()
    if usage_df.empty:
        return {"labels": [], "datasets": []}
    
    # Get last 7 days of data
    latest_dates = usage_df['date'].unique()[-7:]
    daily_energy = []
    
    for date in latest_dates:
        day_data = usage_df[usage_df['date'] == date]
        total_energy = day_data['energy_consumption'].sum()
        daily_energy.append(total_energy)
    
    return {
        "labels": latest_dates.tolist(),
        "datasets": [{
            "label": "Energy Consumption (kWh)",
            "data": daily_energy,
            "backgroundColor": "rgba(16, 185, 129, 0.8)",
            "borderColor": "rgba(16, 185, 129, 1)",
            "borderWidth": 2,
            "fill": True
        }]
    }

@app.get("/api/chart-data/status")
async def get_status_chart_data():
    """Get equipment status distribution"""
    equipment_df = db.get_equipment()
    if equipment_df.empty:
        return {"labels": [], "datasets": []}
    
    status_counts = equipment_df['status'].value_counts()
    
    return {
        "labels": status_counts.index.tolist(),
        "datasets": [{
            "data": status_counts.values.tolist(),
            "backgroundColor": [
                "#10b981",  # Active - green
                "#f59e0b",  # Maintenance - yellow
                "#6b7280",  # Idle - gray
                "#ef4444"   # Critical - red
            ],
            "borderWidth": 0
        }]
    }

@app.get("/api/chart-data/maintenance")
async def get_maintenance_chart_data():
    """Get maintenance schedule chart data"""
    equipment_df = db.get_equipment()
    if equipment_df.empty:
        return {"labels": [], "datasets": []}
    
    from datetime import datetime, timedelta
    
    # Categorize by days until maintenance
    upcoming = 0
    overdue = 0
    
    for _, equipment in equipment_df.iterrows():
        due_date = datetime.strptime(equipment['next_maintenance'], '%Y-%m-%d')
        days_until = (due_date - datetime.now()).days
        
        if days_until < 0:
            overdue += 1
        elif days_until <= 30:
            upcoming += 1
    
    return {
        "labels": ["Upcoming (30 days)", "Overdue"],
        "datasets": [{
            "data": [upcoming, overdue],
            "backgroundColor": ["#f59e0b", "#ef4444"],
            "borderWidth": 0
        }]
    }

@app.get("/api/chart-data/temperature")
async def get_temperature_chart_data():
    """Get temperature trends chart data"""
    sensor_df = db.get_sensor_data()
    if sensor_df.empty:
        return {"labels": [], "datasets": []}
    
    # Get latest 10 readings
    latest_readings = sensor_df.tail(10)
    
    return {
        "labels": [f"Reading {i+1}" for i in range(len(latest_readings))],
        "datasets": [{
            "label": "Temperature (°C)",
            "data": latest_readings['temperature'].tolist(),
            "backgroundColor": "rgba(239, 68, 68, 0.8)",
            "borderColor": "rgba(239, 68, 68, 1)",
            "borderWidth": 2,
            "fill": True
        }]
    }

@app.get("/api/chart-data/efficiency")
async def get_efficiency_chart_data():
    """Get efficiency vs usage chart data"""
    sensor_df = db.get_sensor_data()
    if sensor_df.empty:
        return {"labels": [], "datasets": []}
    
    # Get latest readings for each equipment
    latest_data = sensor_df.groupby('equipment_id').last().reset_index()
    
    return {
        "labels": [f"Equipment {row['equipment_id']}" for _, row in latest_data.iterrows()],
        "datasets": [
            {
                "label": "Efficiency (%)",
                "data": latest_data['efficiency'].tolist(),
                "backgroundColor": "rgba(102, 126, 234, 0.8)",
                "borderColor": "rgba(102, 126, 234, 1)",
                "borderWidth": 2,
                "yAxisID": "y"
            },
            {
                "label": "Usage Hours",
                "data": latest_data['usage_hours'].tolist(),
                "backgroundColor": "rgba(16, 185, 129, 0.8)",
                "borderColor": "rgba(16, 185, 129, 1)",
                "borderWidth": 2,
                "yAxisID": "y1"
            }
        ]
    }

@app.get("/api/alerts")
async def get_alerts():
    return data_processor.get_alerts()

@app.get("/api/equipment")
async def get_equipment():
    equipment_df = db.get_equipment()
    return equipment_df.to_dict(orient='records')

@app.get("/api/equipment/real-time-status")
async def get_real_time_equipment_status():
    """Get real-time equipment status with health metrics"""
    equipment_df = db.get_equipment()
    sensor_df = db.get_sensor_data()
    
    real_time_status = []
    
    for _, equipment in equipment_df.iterrows():
        # Get latest sensor data for this equipment
        equipment_sensors = sensor_df[sensor_df['equipment_id'] == equipment['id']]
        
        if not equipment_sensors.empty:
            latest_sensor = equipment_sensors.iloc[-1]
            
            # Calculate health score based on sensor readings
            health_score = calculate_equipment_health(latest_sensor)
            
            # Determine status based on health score and thresholds
            status = determine_equipment_status(health_score, latest_sensor)
            
            # Check for safety violations
            safety_violations = check_safety_violations(latest_sensor, equipment)
            
            real_time_status.append({
                "id": equipment['id'],
                "name": equipment['name'],
                "type": equipment['type'],
                "location": equipment['location'],
                "status": status,
                "health_score": health_score,
                "last_updated": latest_sensor['timestamp'],
                "sensor_readings": {
                    "temperature": latest_sensor.get('temperature', 0),
                    "vibration": latest_sensor.get('vibration', 0),
                    "pressure": latest_sensor.get('pressure', 0),
                    "efficiency": latest_sensor.get('efficiency', 0),
                    "power_consumption": latest_sensor.get('power_consumption', 0)
                },
                "safety_violations": safety_violations,
                "alerts": generate_equipment_alerts(health_score, latest_sensor, equipment)
            })
        else:
            # No sensor data available
            real_time_status.append({
                "id": equipment['id'],
                "name": equipment['name'],
                "type": equipment['type'],
                "location": equipment['location'],
                "status": "offline",
                "health_score": 0,
                "last_updated": None,
                "sensor_readings": None,
                "safety_violations": [],
                "alerts": [{"type": "warning", "message": "No sensor data available"}]
            })
    
    return real_time_status

def calculate_equipment_health(sensor_data):
    """Calculate equipment health score based on sensor readings"""
    health_score = 100
    
    # Temperature impact (optimal range: 20-40°C)
    temp = sensor_data.get('temperature', 25)
    if temp < 20 or temp > 40:
        health_score -= min(30, abs(temp - 30) * 2)
    
    # Vibration impact (optimal: < 5)
    vibration = sensor_data.get('vibration', 0)
    if vibration > 5:
        health_score -= min(25, vibration * 3)
    
    # Pressure impact (optimal: 80-120)
    pressure = sensor_data.get('pressure', 100)
    if pressure < 80 or pressure > 120:
        health_score -= min(20, abs(pressure - 100) * 0.5)
    
    # Efficiency impact
    efficiency = sensor_data.get('efficiency', 100)
    if efficiency < 80:
        health_score -= (80 - efficiency) * 0.5
    
    return max(0, min(100, health_score))

def determine_equipment_status(health_score, sensor_data):
    """Determine equipment status based on health score and sensor data"""
    if health_score >= 90:
        return "optimal"
    elif health_score >= 70:
        return "good"
    elif health_score >= 50:
        return "warning"
    elif health_score >= 30:
        return "critical"
    else:
        return "failure"

def check_safety_violations(sensor_data, equipment):
    """Check for safety violations based on sensor data"""
    violations = []
    
    # Temperature safety check
    temp = sensor_data.get('temperature', 25)
    if temp > 60:  # Dangerous temperature
        violations.append({
            "type": "temperature",
            "severity": "critical",
            "message": f"Equipment temperature ({temp}°C) exceeds safety limit (60°C)"
        })
    
    # Vibration safety check
    vibration = sensor_data.get('vibration', 0)
    if vibration > 10:  # Dangerous vibration
        violations.append({
            "type": "vibration",
            "severity": "critical",
            "message": f"Excessive vibration detected ({vibration}) - potential mechanical failure"
        })
    
    # Power consumption safety check
    power = sensor_data.get('power_consumption', 0)
    if power > equipment.get('max_power_rating', 1000) * 1.2:  # 20% over rating
        violations.append({
            "type": "power",
            "severity": "warning",
            "message": f"Power consumption ({power}W) exceeds safe operating limits"
        })
    
    return violations

def generate_equipment_alerts(health_score, sensor_data, equipment):
    """Generate alerts based on equipment health and sensor data"""
    alerts = []
    
    if health_score < 50:
        alerts.append({
            "type": "health",
            "severity": "critical" if health_score < 30 else "warning",
            "message": f"Equipment health score is {health_score:.1f}% - immediate attention required"
        })
    
    # Efficiency alert
    efficiency = sensor_data.get('efficiency', 100)
    if efficiency < 70:
        alerts.append({
            "type": "efficiency",
            "severity": "warning",
            "message": f"Equipment efficiency is {efficiency}% - performance degradation detected"
        })
    
    # Maintenance due alert
    last_maintenance = equipment.get('last_maintenance')
    if last_maintenance:
        days_since_maintenance = (datetime.now() - datetime.fromisoformat(last_maintenance)).days
        if days_since_maintenance > 90:  # 3 months
            alerts.append({
                "type": "maintenance",
                "severity": "warning",
                "message": f"Equipment maintenance overdue by {days_since_maintenance - 90} days"
            })
    
    return alerts

@app.websocket("/ws/equipment-monitoring")
async def equipment_monitoring_websocket(websocket: WebSocket):
    """WebSocket endpoint specifically for real-time equipment monitoring"""
    await manager.connect(websocket)
    try:
        while True:
            # Send equipment monitoring updates every 2 seconds
            await asyncio.sleep(2)
            
            # Get real-time equipment status
            real_time_status = await get_real_time_equipment_status()
            
            # Calculate summary statistics
            total_equipment = len(real_time_status)
            optimal_count = sum(1 for eq in real_time_status if eq['status'] == 'optimal')
            warning_count = sum(1 for eq in real_time_status if eq['status'] == 'warning')
            critical_count = sum(1 for eq in real_time_status if eq['status'] == 'critical')
            failure_count = sum(1 for eq in real_time_status if eq['status'] == 'failure')
            offline_count = sum(1 for eq in real_time_status if eq['status'] == 'offline')
            
            # Collect all alerts and safety violations
            all_alerts = []
            all_safety_violations = []
            for equipment in real_time_status:
                for alert in equipment.get('alerts', []):
                    all_alerts.append({
                        "equipment_id": equipment['id'],
                        "equipment_name": equipment['name'],
                        "equipment_location": equipment['location'],
                        "alert": alert,
                        "timestamp": equipment.get('last_updated')
                    })
                
                for violation in equipment.get('safety_violations', []):
                    all_safety_violations.append({
                        "equipment_id": equipment['id'],
                        "equipment_name": equipment['name'],
                        "equipment_location": equipment['location'],
                        "violation": violation,
                        "timestamp": equipment.get('last_updated')
                    })
            
            # Sort alerts by severity (critical first)
            severity_order = {'critical': 0, 'warning': 1, 'info': 2}
            all_alerts.sort(key=lambda x: severity_order.get(x['alert'].get('severity', 'info'), 2))
            all_safety_violations.sort(key=lambda x: severity_order.get(x['violation'].get('severity', 'info'), 2))
            
            monitoring_data = {
                "type": "equipment_monitoring_update",
                "timestamp": datetime.now().isoformat(),
                "summary": {
                    "total_equipment": total_equipment,
                    "optimal": optimal_count,
                    "warning": warning_count,
                    "critical": critical_count,
                    "failure": failure_count,
                    "offline": offline_count,
                    "health_percentage": round((optimal_count / total_equipment * 100) if total_equipment > 0 else 0, 1)
                },
                "equipment_status": real_time_status,
                "alerts": all_alerts,
                "safety_violations": all_safety_violations,
                "critical_count": len([a for a in all_alerts if a['alert'].get('severity') == 'critical']),
                "safety_violation_count": len(all_safety_violations)
            }
            
            await manager.send_personal_message(json.dumps(monitoring_data), websocket)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"Equipment monitoring WebSocket error: {e}")
        manager.disconnect(websocket)

@app.get("/api/equipment/{equipment_id}")
async def get_equipment_details(equipment_id: int):
    equipment_df = db.get_equipment()
    equipment = equipment_df[equipment_df['id'] == equipment_id]
    
    if equipment.empty:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    sensor_df = db.get_sensor_data()
    equipment_sensor_data = sensor_df[sensor_df['equipment_id'] == equipment_id]
    
    maintenance_df = db.get_maintenance_logs()
    equipment_maintenance = maintenance_df[maintenance_df['equipment_id'] == equipment_id]
    
    return {
        "equipment": equipment.iloc[0].to_dict(),
        "sensor_data": equipment_sensor_data.to_dict(orient='records'),
        "maintenance_history": equipment_maintenance.to_dict(orient='records')
    }

@app.get("/api/usage-stats")
async def get_usage_stats():
    return data_processor.get_usage_stats()

@app.get("/api/maintenance-schedule")
async def get_maintenance_schedule():
    return data_processor.get_maintenance_schedule()

@app.get("/api/recent-activity")
async def get_recent_activity():
    return data_processor.get_recent_activity()

@app.get("/api/predict-maintenance/{equipment_id}")
async def predict_maintenance(equipment_id: int):
    return ml_predictor.predict_maintenance(equipment_id)

@app.get("/api/predict-failure/{equipment_id}")
async def predict_failure(equipment_id: int, days_ahead: int = 30):
    return ml_predictor.predict_equipment_failure(equipment_id, days_ahead)

@app.get("/api/anomaly-detection")
async def detect_anomalies(equipment_id: int = None):
    return ml_predictor.detect_anomalies(equipment_id)

@app.get("/api/equipment-health/{equipment_id}")
async def get_equipment_health(equipment_id: int):
    return ml_predictor.get_equipment_health_score(equipment_id)

@app.get("/api/safety-alerts")
async def get_safety_alerts():
    return data_processor.get_safety_alerts()

@app.get("/api/compliance-report")
async def get_compliance_report():
    return data_processor.get_compliance_report()

@app.get("/api/energy-analytics")
async def get_energy_analytics():
    return data_processor.get_energy_analytics()

@app.get("/api/equipment/{equipment_id}/predictive-maintenance")
async def get_predictive_maintenance(equipment_id: int):
    return ml_predictor.predict_maintenance(equipment_id)

@app.post("/api/sensor-data")
async def add_sensor_data(sensor_data: SensorData):
    db.add_sensor_data(sensor_data)
    return {"message": "Sensor data added successfully"}

@app.post("/api/maintenance-log")
async def add_maintenance_log(maintenance_log: MaintenanceLog):
    db.add_maintenance_log(maintenance_log)
    return {"message": "Maintenance log added successfully"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2024-03-20T08:00:00Z"}

# ===== NEW ENHANCED FEATURES =====

# AI Insights and Analytics
@app.get("/api/ai-insights")
async def get_ai_insights():
    """Get AI-generated insights and recommendations"""
    sensor_data = db.get_sensor_data()
    equipment_data = db.get_equipment()
    
    # Convert to model objects
    sensor_objects = [SensorData(**row.to_dict()) for _, row in sensor_data.iterrows()]
    equipment_objects = [Equipment(**row.to_dict()) for _, row in equipment_data.iterrows()]
    
    insights = await ai_insights_engine.generate_insights(sensor_objects, equipment_objects)
    return [insight.dict() for insight in insights]

@app.get("/api/ai-insights/{insight_id}/visualization")
async def get_insight_visualization(insight_id: int):
    """Get visualization data for specific insight"""
    # In a real implementation, you would fetch the insight from database
    # For demo purposes, return sample visualization data
    return {
        "insight_id": insight_id,
        "chart_type": "line",
        "data": [
            {"timestamp": "2024-03-20T08:00:00Z", "value": 85.2},
            {"timestamp": "2024-03-20T09:00:00Z", "value": 87.1},
            {"timestamp": "2024-03-20T10:00:00Z", "value": 89.3}
        ],
        "title": "Equipment Efficiency Trend",
        "x_axis": "Time",
        "y_axis": "Efficiency (%)"
    }

# Gamification System
@app.get("/api/gamification/leaderboard")
async def get_leaderboard():
    """Get gamification leaderboard"""
    # In a real implementation, you would fetch users from database
    sample_users = [
        User(id=1, username="john_doe", email="john@example.com", role=UserRole.TRAINER,
             first_name="John", last_name="Doe", created_at=datetime.now().isoformat(),
             badge_points=1250, achievements=["Safety First", "Efficiency Expert"]),
        User(id=2, username="jane_smith", email="jane@example.com", role=UserRole.LAB_MANAGER,
             first_name="Jane", last_name="Smith", created_at=datetime.now().isoformat(),
             badge_points=2100, achievements=["Maintenance Hero", "Innovation Leader"]),
        User(id=3, username="bob_wilson", email="bob@example.com", role=UserRole.STUDENT,
             first_name="Bob", last_name="Wilson", created_at=datetime.now().isoformat(),
             badge_points=850, achievements=["Safety First"])
    ]
    
    leaderboard = gamification_engine.generate_leaderboard(sample_users)
    return leaderboard

@app.get("/api/gamification/badges")
async def get_badges():
    """Get all available badges"""
    return [badge.dict() for badge in gamification_engine.badges]

@app.get("/api/gamification/user/{user_id}/stats")
async def get_user_gamification_stats(user_id: int):
    """Get user's gamification statistics"""
    # In a real implementation, you would fetch user from database
    sample_user = User(id=user_id, username="user", email="user@example.com", 
                      role=UserRole.TRAINER, first_name="User", last_name="Name",
                      created_at=datetime.now().isoformat(), badge_points=1000)
    
    stats = GamificationStats(
        user_id=user_id,
        total_points=sample_user.badge_points or 0,
        level=gamification_engine.calculate_level(sample_user.badge_points or 0),
        badges_earned=len(sample_user.achievements or []),
        streak_days=gamification_engine.calculate_streak_days(sample_user),
        safe_usage_hours=150.5,
        efficiency_score=0.87,
        maintenance_contributions=5,
        safety_reports=3,
        training_completions=12
    )
    return stats.dict()

@app.get("/api/gamification/challenges/{user_role}")
async def get_role_challenges(user_role: UserRole):
    """Get role-specific challenges"""
    challenges = gamification_engine.get_role_specific_challenges(user_role)
    return challenges

# AI Chatbot
@app.post("/api/chatbot/message")
async def send_chat_message(message: str, user_id: int, equipment_id: int = None):
    """Send message to AI chatbot"""
    ai_response = await ai_chatbot.process_message(message, user_id, equipment_id)
    return ai_response.dict()

@app.get("/api/chatbot/history/{user_id}")
async def get_chat_history(user_id: int):
    """Get user's chat history"""
    # In a real implementation, you would fetch from database
    return [
        {
            "id": 1,
            "user_id": user_id,
            "message": "Hello, I need help with equipment troubleshooting",
            "timestamp": datetime.now().isoformat(),
            "is_ai_response": False
        },
        {
            "id": 2,
            "user_id": user_id,
            "message": "I can help you with equipment troubleshooting. What specific issue are you experiencing?",
            "timestamp": datetime.now().isoformat(),
            "is_ai_response": True
        }
    ]

# Virtual Lab Environment
@app.get("/api/virtual-lab/environments")
async def get_virtual_environments():
    """Get all virtual lab environments"""
    return [env.dict() for env in virtual_lab_engine.environments]

@app.get("/api/virtual-lab/environment/{environment_id}")
async def get_virtual_environment(environment_id: int):
    """Get specific virtual lab environment"""
    environment = virtual_lab_engine.get_environment_by_id(environment_id)
    if not environment:
        raise HTTPException(status_code=404, detail="Environment not found")
    return environment.dict()

@app.get("/api/virtual-lab/environment/{environment_id}/scenario/{scenario_type}")
async def create_interactive_scenario(environment_id: int, scenario_type: str):
    """Create interactive learning scenario"""
    scenario = virtual_lab_engine.create_interactive_scenario(environment_id, scenario_type)
    return scenario

@app.post("/api/virtual-lab/equipment/{equipment_id}/interact")
async def interact_with_equipment(equipment_id: int, interaction_type: str, user_input: Dict[str, Any]):
    """Interact with virtual equipment"""
    result = virtual_lab_engine.simulate_equipment_interaction(equipment_id, interaction_type, user_input)
    return result

@app.get("/api/virtual-lab/environment/{environment_id}/statistics")
async def get_environment_statistics(environment_id: int):
    """Get virtual environment statistics"""
    stats = virtual_lab_engine.get_environment_statistics(environment_id)
    return stats

# Notifications
@app.get("/api/notifications/{user_id}")
async def get_user_notifications(user_id: int):
    """Get user notifications"""
    # In a real implementation, you would fetch from database
    notifications = [
        {
            "id": 1,
            "user_id": user_id,
            "title": "Equipment Alert: CNC Machine",
            "message": "High temperature detected on CNC Machine #1",
            "type": "equipment",
            "priority": "high",
            "timestamp": datetime.now().isoformat(),
            "read": False,
            "equipment_id": 1
        },
        {
            "id": 2,
            "user_id": user_id,
            "title": "Achievement Unlocked! 🏆",
            "message": "Congratulations! You've earned the 'Safety First' badge.",
            "type": "gamification",
            "priority": "low",
            "timestamp": datetime.now().isoformat(),
            "read": False
        }
    ]
    return notifications

@app.post("/api/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: int):
    """Mark notification as read"""
    return {"message": "Notification marked as read", "notification_id": notification_id}

# Role-based User Management
@app.get("/api/users")
async def get_users():
    """Get all users"""
    # In a real implementation, you would fetch from database
    users = [
        User(id=1, username="trainer1", email="trainer1@example.com", role=UserRole.TRAINER,
             first_name="John", last_name="Doe", created_at=datetime.now().isoformat()),
        User(id=2, username="manager1", email="manager1@example.com", role=UserRole.LAB_MANAGER,
             first_name="Jane", last_name="Smith", created_at=datetime.now().isoformat()),
        User(id=3, username="policy1", email="policy1@example.com", role=UserRole.POLICYMAKER,
             first_name="Bob", last_name="Wilson", created_at=datetime.now().isoformat()),
        User(id=4, username="student1", email="student1@example.com", role=UserRole.STUDENT,
             first_name="Alice", last_name="Johnson", created_at=datetime.now().isoformat())
    ]
    return [user.dict() for user in users]

@app.get("/api/users/{user_id}")
async def get_user(user_id: int):
    """Get specific user"""
    # In a real implementation, you would fetch from database
    user = User(id=user_id, username="user", email="user@example.com", role=UserRole.TRAINER,
               first_name="User", last_name="Name", created_at=datetime.now().isoformat())
    return user.dict()

@app.get("/api/users/role/{role}/dashboard")
async def get_role_dashboard(role: UserRole):
    """Get role-specific dashboard data"""
    dashboards = {
        UserRole.TRAINER: {
            "title": "Trainer Dashboard",
            "widgets": ["training_sessions", "student_progress", "equipment_status", "safety_alerts"],
            "quick_actions": ["start_training", "report_issue", "check_schedule"]
        },
        UserRole.LAB_MANAGER: {
            "title": "Lab Manager Dashboard",
            "widgets": ["equipment_overview", "maintenance_schedule", "usage_analytics", "compliance_status"],
            "quick_actions": ["schedule_maintenance", "view_reports", "manage_users"]
        },
        UserRole.POLICYMAKER: {
            "title": "Policy Maker Dashboard",
            "widgets": ["compliance_overview", "safety_metrics", "cost_analysis", "trend_reports"],
            "quick_actions": ["view_compliance", "generate_report", "set_policies"]
        },
        UserRole.STUDENT: {
            "title": "Student Dashboard",
            "widgets": ["learning_progress", "available_equipment", "achievements", "training_schedule"],
            "quick_actions": ["book_equipment", "start_learning", "view_progress"]
        }
    }
    return dashboards.get(role, {})

# Community Feedback
@app.get("/api/community/feedback")
async def get_community_feedback():
    """Get community feedback"""
    # In a real implementation, you would fetch from database
    feedback = [
        {
            "id": 1,
            "user_id": 1,
            "category": "feature_request",
            "title": "Add mobile app support",
            "description": "It would be great to have a mobile app for easier access",
            "priority": "medium",
            "status": "open",
            "created_at": datetime.now().isoformat(),
            "votes": 15,
            "tags": ["mobile", "accessibility"]
        },
        {
            "id": 2,
            "user_id": 2,
            "category": "bug_report",
            "title": "Dashboard loading issue",
            "description": "Dashboard sometimes takes too long to load",
            "priority": "high",
            "status": "in_progress",
            "created_at": datetime.now().isoformat(),
            "votes": 8,
            "tags": ["dashboard", "performance"]
        }
    ]
    return feedback

@app.post("/api/community/feedback")
async def submit_feedback(feedback: CommunityFeedback):
    """Submit community feedback"""
    return {"message": "Feedback submitted successfully", "feedback_id": feedback.id}

# Technology Stack
@app.get("/api/technology/stack")
async def get_technology_stack():
    """Get technology stack information"""
    tech_stack = [
        {
            "category": "Backend",
            "name": "FastAPI",
            "description": "Modern, fast web framework for building APIs",
            "version": "0.104.1",
            "purpose": "API development",
            "integration_status": "active"
        },
        {
            "category": "Machine Learning",
            "name": "scikit-learn",
            "description": "Machine learning library for Python",
            "version": "1.3.2",
            "purpose": "Predictive analytics",
            "integration_status": "active"
        },
        {
            "category": "Frontend",
            "name": "Three.js",
            "description": "3D graphics library for web",
            "version": "r158",
            "purpose": "3D virtual lab",
            "integration_status": "active"
        },
        {
            "category": "Database",
            "name": "PostgreSQL",
            "description": "Advanced open source relational database",
            "version": "15.0",
            "purpose": "Data storage",
            "integration_status": "active"
        }
    ]
    return tech_stack

# Scalability Demos
@app.get("/api/scalability/demos")
async def get_scalability_demos():
    """Get scalability demonstration data"""
    demos = [
        {
            "id": 1,
            "name": "Multi-Campus Implementation",
            "description": "Successfully deployed across 5 campuses with 200+ equipment units",
            "lab_type": "Manufacturing",
            "equipment_count": 200,
            "user_count": 500,
            "data_points_per_day": 50000,
            "performance_metrics": {
                "response_time": "150ms",
                "uptime": "99.9%",
                "throughput": "1000 req/sec"
            },
            "cost_analysis": {
                "monthly_cost": 5000,
                "cost_per_user": 10,
                "roi_percentage": 250
            },
            "implementation_timeline": "6 months",
            "success_factors": ["Cloud infrastructure", "Modular design", "Training program"],
            "challenges_overcome": ["Network latency", "Data synchronization", "User adoption"],
            "lessons_learned": ["Start small", "Focus on training", "Monitor performance"]
        }
    ]
    return demos

# WebSocket for real-time updates
@app.post("/api/performance")
async def log_performance(performance_data: dict):
    """Log performance metrics from frontend"""
    try:
        print(f"Performance data received: {performance_data}")
        return {"status": "success", "message": "Performance data logged"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Send real-time updates every 3 seconds
            await asyncio.sleep(3)
            
            # Get real-time data from database
            overview_stats = data_processor.get_overview_stats()
            alerts = data_processor.get_alerts()
            recent_activity = data_processor.get_recent_activity()
            
            # Get latest sensor data
            sensor_df = db.get_sensor_data()
            latest_sensor_data = []
            if not sensor_df.empty:
                latest_readings = sensor_df.groupby('equipment_id').last().reset_index()
                latest_sensor_data = latest_readings.to_dict(orient='records')
            
            # Get equipment status updates
            equipment_df = db.get_equipment()
            equipment_status = equipment_df.to_dict(orient='records') if not equipment_df.empty else []
            
            # Get real-time equipment monitoring data
            real_time_equipment_status = await get_real_time_equipment_status()
            
            # Extract critical alerts and safety violations
            critical_alerts = []
            safety_violations = []
            for equipment in real_time_equipment_status:
                for alert in equipment.get('alerts', []):
                    if alert.get('severity') == 'critical':
                        critical_alerts.append({
                            "equipment_id": equipment['id'],
                            "equipment_name": equipment['name'],
                            "alert": alert
                        })
                
                for violation in equipment.get('safety_violations', []):
                    if violation.get('severity') == 'critical':
                        safety_violations.append({
                            "equipment_id": equipment['id'],
                            "equipment_name": equipment['name'],
                            "violation": violation
                        })
            
            data = {
                "type": "real_time_update",
                "timestamp": datetime.now().isoformat(),
                "overview_stats": overview_stats,
                "alerts": [alert.dict() for alert in alerts] if alerts else [],
                "recent_activity": recent_activity,
                "sensor_data": latest_sensor_data,
                "equipment_status": equipment_status,
                "real_time_equipment_status": real_time_equipment_status,
                "critical_alerts": critical_alerts,
                "safety_violations": safety_violations,
                "active_connections": len(manager.active_connections)
            }
            
            await manager.send_personal_message(json.dumps(data), websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

# Background task for continuous data updates
async def background_data_updater():
    """Background task to continuously update sensor data"""
    while True:
        try:
            # Simulate new sensor readings
            sensor_df = db.get_sensor_data()
            if not sensor_df.empty:
                # Add new sensor data every 10 seconds
                from datetime import datetime
                import random
                
                # Get latest equipment IDs
                equipment_df = db.get_equipment()
                if not equipment_df.empty:
                    for _, equipment in equipment_df.iterrows():
                        new_sensor_data = SensorData(
                            timestamp=datetime.now().isoformat(),
                            equipment_id=equipment['id'],
                            temperature=round(random.uniform(20, 80), 1),
                            vibration=round(random.uniform(0.1, 0.5), 2),
                            power_consumption=round(random.uniform(1.0, 10.0), 1),
                            usage_hours=round(random.uniform(0.1, 2.0), 1),
                            efficiency=round(random.uniform(70, 100), 1),
                            humidity=round(random.uniform(30, 70), 1),
                            pressure=round(random.uniform(1.0, 1.5), 2),
                            rpm=round(random.uniform(1000, 5000), 0),
                            oil_level=round(random.uniform(20, 100), 1),
                            noise_level=round(random.uniform(40, 80), 1),
                            voltage=round(random.uniform(220, 240), 1),
                            current=round(random.uniform(5, 20), 1)
                        )
                        db.add_sensor_data(new_sensor_data)
            
            await asyncio.sleep(10)  # Update every 10 seconds
        except Exception as e:
            print(f"Background updater error: {e}")
            await asyncio.sleep(30)  # Wait longer on error

# Start background task when app starts
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(background_data_updater())

# Serve frontend files (must be after API routes)
@app.get("/")
async def serve_frontend():
    # Get the parent directory (project root) and then frontend
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    frontend_path = os.path.join(project_root, "frontend", "index.html")
    if os.path.exists(frontend_path):
        return FileResponse(frontend_path)
    raise HTTPException(status_code=404, detail=f"Frontend not found at {frontend_path}")

@app.get("/{path:path}")
async def serve_static_files(path: str):
    # Don't serve static files for API routes
    if path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API endpoint not found")
    
    # Get the parent directory (project root) and then frontend
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    frontend_path = os.path.join(project_root, "frontend", path)
    if os.path.exists(frontend_path):
        return FileResponse(frontend_path)
    raise HTTPException(status_code=404, detail=f"File not found: {path}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)