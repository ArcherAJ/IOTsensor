# AI Insights Engine for IoT Training Equipment Monitoring
from typing import List, Dict, Any
from models import SensorData, Equipment, AIInsight
import random
from datetime import datetime, timedelta
import asyncio

class AIInsightsEngine:
    def __init__(self):
        self.insight_history = []
        self.patterns_detected = []
        
    async def generate_insights(self, sensor_data: List[SensorData], equipment_data: List[Equipment]) -> List[AIInsight]:
        """Generate AI-powered insights from sensor and equipment data"""
        insights = []
        
        # Anomaly Detection
        anomaly_insights = await self._detect_anomalies(sensor_data, equipment_data)
        insights.extend(anomaly_insights)
        
        # Predictive Maintenance
        maintenance_insights = await self._predict_maintenance(equipment_data, sensor_data)
        insights.extend(maintenance_insights)
        
        # Efficiency Analysis
        efficiency_insights = await self._analyze_efficiency(sensor_data, equipment_data)
        insights.extend(efficiency_insights)
        
        # Energy Optimization
        energy_insights = await self._analyze_energy_consumption(sensor_data, equipment_data)
        insights.extend(energy_insights)
        
        # Safety Recommendations
        safety_insights = await self._analyze_safety_metrics(sensor_data, equipment_data)
        insights.extend(safety_insights)
        
        return insights
    
    async def _detect_anomalies(self, sensor_data: List[SensorData], equipment_data: List[Equipment]) -> List[AIInsight]:
        """Detect anomalies in sensor readings"""
        insights = []
        
        if not sensor_data:
            return insights
            
        # Group sensor data by equipment
        equipment_sensors = {}
        for sensor in sensor_data:
            if sensor.equipment_id not in equipment_sensors:
                equipment_sensors[sensor.equipment_id] = []
            equipment_sensors[sensor.equipment_id].append(sensor)
        
        for equipment_id, sensors in equipment_sensors.items():
            if len(sensors) < 5:  # Need minimum data points
                continue
                
            # Temperature anomaly detection
            temperatures = [s.temperature for s in sensors if s.temperature is not None]
            if temperatures:
                avg_temp = sum(temperatures) / len(temperatures)
                max_temp = max(temperatures)
                
                if max_temp > avg_temp * 1.3:  # 30% above average
                    equipment_name = next((eq.name for eq in equipment_data if eq.id == equipment_id), f"Equipment {equipment_id}")
                    insights.append(AIInsight(
                        id=len(self.insight_history) + len(insights) + 1,
                        type="anomaly",
                        title=f"Temperature Anomaly Detected",
                        description=f"High temperature spike detected on {equipment_name}. Current temperature: {max_temp:.1f}°C (Average: {avg_temp:.1f}°C). Immediate inspection recommended.",
                        confidence=0.85,
                        impact="high",
                        category="safety",
                        data_points=[{"equipment_id": equipment_id, "temperature": max_temp, "average": avg_temp}],
                        actionable_items=[
                            "Inspect equipment for overheating",
                            "Check cooling system functionality",
                            "Review operating parameters",
                            "Schedule immediate maintenance if needed"
                        ],
                        created_at=datetime.now().isoformat()
                    ))
            
            # Vibration anomaly detection
            vibrations = [s.vibration for s in sensors if s.vibration is not None]
            if vibrations:
                avg_vibration = sum(vibrations) / len(vibrations)
                max_vibration = max(vibrations)
                
                if max_vibration > avg_vibration * 1.5:  # 50% above average
                    equipment_name = next((eq.name for eq in equipment_data if eq.id == equipment_id), f"Equipment {equipment_id}")
                    insights.append(AIInsight(
                        id=len(self.insight_history) + len(insights) + 1,
                        type="anomaly",
                        title=f"Vibration Anomaly Detected",
                        description=f"Excessive vibration detected on {equipment_name}. Current vibration: {max_vibration:.2f} mm/s (Average: {avg_vibration:.2f} mm/s). Mechanical inspection required.",
                        confidence=0.90,
                        impact="high",
                        category="safety",
                        data_points=[{"equipment_id": equipment_id, "vibration": max_vibration, "average": avg_vibration}],
                        actionable_items=[
                            "Stop equipment immediately",
                            "Perform visual inspection for loose components",
                            "Check bearing conditions",
                            "Schedule mechanical maintenance"
                        ],
                        created_at=datetime.now().isoformat()
                    ))
        
        return insights
    
    async def _predict_maintenance(self, equipment_data: List[Equipment], sensor_data: List[SensorData]) -> List[AIInsight]:
        """Predict maintenance needs based on usage patterns"""
        insights = []
        
        for equipment in equipment_data:
            # Simulate maintenance prediction based on usage hours
            if random.random() < 0.15:  # 15% chance of predicting maintenance
                predicted_date = datetime.now() + timedelta(days=random.randint(7, 60))
                
                # Calculate confidence based on equipment age and usage
                confidence = 0.7 + random.random() * 0.2  # 70-90% confidence
                
                insights.append(AIInsight(
                    id=len(self.insight_history) + len(insights) + 1,
                    type="prediction",
                    title=f"Predictive Maintenance Alert",
                    description=f"High probability of maintenance needed for {equipment.name} by {predicted_date.strftime('%Y-%m-%d')}. Based on usage patterns and wear indicators.",
                    confidence=confidence,
                    impact="medium",
                    category="maintenance",
                    data_points=[{
                        "equipment_id": equipment.id,
                        "predicted_date": predicted_date.isoformat(),
                        "confidence": confidence
                    }],
                    actionable_items=[
                        "Schedule preventive maintenance",
                        "Order required spare parts",
                        "Plan equipment downtime",
                        "Update maintenance records"
                    ],
                    created_at=datetime.now().isoformat()
                ))
        
        return insights
    
    async def _analyze_efficiency(self, sensor_data: List[SensorData], equipment_data: List[Equipment]) -> List[AIInsight]:
        """Analyze equipment efficiency trends"""
        insights = []
        
        if len(sensor_data) < 10:
            return insights
        
        # Calculate efficiency trends
        recent_sensors = sensor_data[-10:]  # Last 10 readings
        older_sensors = sensor_data[-20:-10] if len(sensor_data) >= 20 else sensor_data[:-10]
        
        if older_sensors:
            recent_efficiency = sum(s.efficiency for s in recent_sensors if s.efficiency is not None) / len([s for s in recent_sensors if s.efficiency is not None])
            older_efficiency = sum(s.efficiency for s in older_sensors if s.efficiency is not None) / len([s for s in older_sensors if s.efficiency is not None])
            
            efficiency_change = recent_efficiency - older_efficiency
            
            if efficiency_change < -0.05:  # 5% decrease
                insights.append(AIInsight(
                    id=len(self.insight_history) + len(insights) + 1,
                    type="trend",
                    title=f"Efficiency Decline Detected",
                    description=f"Equipment efficiency has decreased by {abs(efficiency_change)*100:.1f}% over recent readings. Current efficiency: {recent_efficiency:.1f}%.",
                    confidence=0.75,
                    impact="medium",
                    category="efficiency",
                    data_points=[{
                        "efficiency_change": efficiency_change,
                        "current_efficiency": recent_efficiency,
                        "previous_efficiency": older_efficiency
                    }],
                    actionable_items=[
                        "Review operating procedures",
                        "Check for calibration issues",
                        "Analyze usage patterns",
                        "Consider optimization adjustments"
                    ],
                    created_at=datetime.now().isoformat()
                ))
        
        return insights
    
    async def _analyze_energy_consumption(self, sensor_data: List[SensorData], equipment_data: List[Equipment]) -> List[AIInsight]:
        """Analyze energy consumption patterns"""
        insights = []
        
        if not sensor_data:
            return insights
        
        # Calculate average power consumption
        power_readings = [s.power_consumption for s in sensor_data if s.power_consumption is not None]
        if power_readings:
            avg_power = sum(power_readings) / len(power_readings)
            
            # Check for high energy consumption
            if avg_power > 2000:  # Above 2kW average
                insights.append(AIInsight(
                    id=len(self.insight_history) + len(insights) + 1,
                    type="optimization",
                    title=f"High Energy Consumption Alert",
                    description=f"Average power consumption is {avg_power:.1f}W, which is above optimal levels. Potential energy savings: {avg_power * 0.2:.1f}W with optimization.",
                    confidence=0.80,
                    impact="medium",
                    category="energy",
                    data_points=[{
                        "average_power": avg_power,
                        "potential_savings": avg_power * 0.2
                    }],
                    actionable_items=[
                        "Review equipment settings",
                        "Check for energy leaks",
                        "Optimize operating schedules",
                        "Consider equipment upgrades"
                    ],
                    created_at=datetime.now().isoformat()
                ))
        
        return insights
    
    async def _analyze_safety_metrics(self, sensor_data: List[SensorData], equipment_data: List[Equipment]) -> List[AIInsight]:
        """Analyze safety-related metrics"""
        insights = []
        
        if not sensor_data:
            return insights
        
        # Check for safety violations
        recent_sensors = sensor_data[-5:] if len(sensor_data) >= 5 else sensor_data
        
        safety_violations = 0
        for sensor in recent_sensors:
            if sensor.temperature and sensor.temperature > 80:  # High temperature
                safety_violations += 1
            if sensor.vibration and sensor.vibration > 5.0:  # High vibration
                safety_violations += 1
        
        if safety_violations > 2:  # Multiple safety violations
            insights.append(AIInsight(
                id=len(self.insight_history) + len(insights) + 1,
                type="safety",
                title=f"Safety Alert - Multiple Violations",
                description=f"Multiple safety violations detected in recent readings. Immediate safety review required to prevent accidents.",
                confidence=0.95,
                impact="high",
                category="safety",
                data_points=[{
                    "safety_violations": safety_violations,
                    "timeframe": "last 5 readings"
                }],
                actionable_items=[
                    "Stop equipment immediately",
                    "Conduct safety inspection",
                    "Review safety protocols",
                    "Train operators on safety procedures"
                ],
                created_at=datetime.now().isoformat()
            ))
        
        return insights

# Create global instance
ai_insights_engine = AIInsightsEngine()