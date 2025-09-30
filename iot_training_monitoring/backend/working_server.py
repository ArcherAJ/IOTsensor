#!/usr/bin/env python3
"""
Working server with hardcoded data to test frontend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn

app = FastAPI(title="Working IoT Test API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hardcoded test data
TEST_OVERVIEW = {
    "total_equipment": 30,
    "active_equipment": 13,
    "maintenance_alerts": 2,
    "uptime_percentage": 43.33,
    "total_usage_hours": 4301.64,
    "total_energy_consumption": 87799.71,
    "total_cost": 133560.93,
    "safety_incidents": 228,
    "efficiency_average": 85.19
}

TEST_EQUIPMENT = [
    {
        "id": 1,
        "name": "CNC Machine #01",
        "type": "CNC Machine",
        "location": "Manufacturing Lab A",
        "status": "Active",
        "health_score": 85.5,
        "last_updated": "2025-09-30T18:30:00",
        "sensor_readings": {
            "temperature": 35.2,
            "vibration": 0.15,
            "pressure": 95.5,
            "efficiency": 87.3,
            "power_consumption": 150.2
        },
        "alerts": [],
        "safety_violations": []
    },
    {
        "id": 2,
        "name": "Robotic Arm #02",
        "type": "Robotic Arm",
        "location": "Manufacturing Lab B",
        "status": "Warning",
        "health_score": 65.2,
        "last_updated": "2025-09-30T18:30:00",
        "sensor_readings": {
            "temperature": 42.1,
            "vibration": 0.25,
            "pressure": 88.3,
            "efficiency": 72.1,
            "power_consumption": 180.5
        },
        "alerts": [
            {
                "type": "efficiency",
                "severity": "warning",
                "message": "Equipment efficiency is 72.1% - performance degradation detected"
            }
        ],
        "safety_violations": []
    },
    {
        "id": 3,
        "name": "Conveyor Belt #03",
        "type": "Conveyor Belt",
        "location": "Assembly Floor",
        "status": "Critical",
        "health_score": 45.8,
        "last_updated": "2025-09-30T18:30:00",
        "sensor_readings": {
            "temperature": 55.7,
            "vibration": 0.45,
            "pressure": 75.2,
            "efficiency": 58.9,
            "power_consumption": 220.1
        },
        "alerts": [
            {
                "type": "health",
                "severity": "critical",
                "message": "Equipment health score is 45.8% - immediate attention required"
            },
            {
                "type": "efficiency",
                "severity": "warning",
                "message": "Equipment efficiency is 58.9% - performance degradation detected"
            }
        ],
        "safety_violations": [
            {
                "type": "temperature",
                "severity": "critical",
                "message": "Equipment temperature (55.7°C) exceeds safety limit (60°C)"
            }
        ]
    }
]

@app.get("/")
async def root():
    return {"message": "Working IoT Test Server is running!"}

@app.get("/api/overview")
async def get_overview():
    """Get overview statistics"""
    return TEST_OVERVIEW

@app.get("/api/equipment")
async def get_equipment():
    """Get equipment list"""
    return TEST_EQUIPMENT

@app.get("/api/equipment/real-time-status")
async def get_real_time_equipment_status():
    """Get real-time equipment status"""
    return TEST_EQUIPMENT

@app.get("/api/alerts")
async def get_alerts():
    """Get alerts"""
    alerts = []
    for equipment in TEST_EQUIPMENT:
        for alert in equipment.get('alerts', []):
            alerts.append({
                "equipment_id": equipment['id'],
                "equipment_name": equipment['name'],
                "alert": alert,
                "timestamp": equipment['last_updated']
            })
    return alerts

@app.get("/api/usage-stats")
async def get_usage_stats():
    """Get usage statistics"""
    return {
        "total_hours": 4301.64,
        "average_efficiency": 85.19,
        "energy_consumption": 87799.71,
        "cost": 133560.93
    }

@app.get("/api/maintenance-schedule")
async def get_maintenance_schedule():
    """Get maintenance schedule"""
    return [
        {
            "equipment_id": 2,
            "equipment_name": "Robotic Arm #02",
            "scheduled_date": "2025-10-05",
            "type": "Preventive",
            "status": "Scheduled"
        },
        {
            "equipment_id": 3,
            "equipment_name": "Conveyor Belt #03",
            "scheduled_date": "2025-10-01",
            "type": "Emergency",
            "status": "Urgent"
        }
    ]

@app.get("/api/recent-activity")
async def get_recent_activity():
    """Get recent activity"""
    return [
        {
            "timestamp": "2025-09-30T18:30:00",
            "equipment_name": "CNC Machine #01",
            "activity": "Started operation",
            "status": "success"
        },
        {
            "timestamp": "2025-09-30T18:25:00",
            "equipment_name": "Robotic Arm #02",
            "activity": "Performance warning",
            "status": "warning"
        },
        {
            "timestamp": "2025-09-30T18:20:00",
            "equipment_name": "Conveyor Belt #03",
            "activity": "Temperature alert",
            "status": "critical"
        }
    ]

@app.get("/api/safety-alerts")
async def get_safety_alerts():
    """Get safety alerts"""
    alerts = []
    for equipment in TEST_EQUIPMENT:
        for violation in equipment.get('safety_violations', []):
            alerts.append({
                "equipment_id": equipment['id'],
                "equipment_name": equipment['name'],
                "violation": violation,
                "timestamp": equipment['last_updated']
            })
    return alerts

@app.get("/api/compliance-report")
async def get_compliance_report():
    """Get compliance report"""
    return {
        "overall_compliance": 85.5,
        "safety_score": 78.2,
        "maintenance_compliance": 92.1,
        "training_compliance": 88.7
    }

@app.get("/api/energy-analytics")
async def get_energy_analytics():
    """Get energy analytics"""
    return {
        "total_consumption": 87799.71,
        "average_per_equipment": 2926.66,
        "peak_consumption": 12500.0,
        "efficiency_rating": 85.19
    }

if __name__ == "__main__":
    print("Starting working test server on port 8002...")
    uvicorn.run(app, host="127.0.0.1", port=8002)
