import pandas as pd
from datetime import datetime, timedelta
from database import db
from models import Alert

class DataProcessor:
    def __init__(self):
        self.db = db
    
    def get_overview_stats(self):
        equipment_df = self.db.get_equipment()
        sensor_df = self.db.get_sensor_data()
        maintenance_df = self.db.get_maintenance_logs()
        usage_df = self.db.get_usage_data()
        
        total_equipment = len(equipment_df)
        active_equipment = len(equipment_df[equipment_df['status'] == 'Active'])
        
        # Count maintenance alerts (equipment with Warning or Critical status)
        maintenance_alerts = len(equipment_df[equipment_df['status'].isin(['Warning', 'Critical'])])
        
        # Calculate uptime percentage (simplified)
        total_possible_hours = total_equipment * 24  # 24 hours per equipment
        active_hours = active_equipment * 24
        uptime_percentage = round((active_hours / total_possible_hours) * 100, 2) if total_possible_hours > 0 else 0
        
        # Calculate total usage hours
        total_usage_hours = sensor_df['usage_hours'].sum() if not sensor_df.empty else 0
        
        # Calculate total energy consumption
        total_energy_consumption = usage_df['energy_consumption'].sum() if not usage_df.empty else 0
        
        # Calculate total cost
        total_cost = usage_df['cost_per_hour'].multiply(usage_df['daily_usage_hours']).sum() if not usage_df.empty else 0
        
        # Calculate safety incidents
        safety_incidents = usage_df['safety_incidents'].sum() if not usage_df.empty else 0
        
        # Calculate average efficiency
        efficiency_average = sensor_df['efficiency'].mean() if not sensor_df.empty and 'efficiency' in sensor_df.columns else 0
        
        return {
            "total_equipment": int(total_equipment),
            "active_equipment": int(active_equipment),
            "maintenance_alerts": int(maintenance_alerts),
            "uptime_percentage": float(uptime_percentage),
            "total_usage_hours": float(round(total_usage_hours, 2)),
            "total_energy_consumption": float(round(total_energy_consumption, 2)),
            "total_cost": float(round(total_cost, 2)),
            "safety_incidents": int(safety_incidents),
            "efficiency_average": float(round(efficiency_average, 2))
        }
    
    def get_alerts(self):
        equipment_df = self.db.get_equipment()
        sensor_df = self.db.get_sensor_data()
        usage_df = self.db.get_usage_data()
        
        alerts = []
        alert_id = 1
        
        # Check for equipment status alerts
        for _, equipment in equipment_df.iterrows():
            if equipment['status'] == 'Critical':
                alerts.append(Alert(
                    id=alert_id,
                    equipment_id=equipment['id'],
                    equipment_name=equipment['name'],
                    alert_type="Equipment Status",
                    severity="High",
                    message=f"Equipment {equipment['name']} is in critical condition",
                    timestamp=datetime.now().isoformat()
                ))
                alert_id += 1
            elif equipment['status'] == 'Warning':
                alerts.append(Alert(
                    id=alert_id,
                    equipment_id=equipment['id'],
                    equipment_name=equipment['name'],
                    alert_type="Equipment Status",
                    severity="Medium",
                    message=f"Equipment {equipment['name']} needs attention",
                    timestamp=datetime.now().isoformat()
                ))
                alert_id += 1
        
        # Check for sensor-based alerts
        if not sensor_df.empty:
            latest_sensor_data = sensor_df.groupby('equipment_id').last().reset_index()
            
            for _, sensor in latest_sensor_data.iterrows():
                equipment = equipment_df[equipment_df['id'] == sensor['equipment_id']].iloc[0]
                
                # Temperature alert
                if sensor['temperature'] > 60:
                    alerts.append(Alert(
                        id=alert_id,
                        equipment_id=equipment['id'],
                        equipment_name=equipment['name'],
                        alert_type="High Temperature",
                        severity="High",
                        message=f"High temperature detected: {sensor['temperature']}°C",
                        timestamp=datetime.now().isoformat()
                    ))
                    alert_id += 1
                
                # Vibration alert
                if sensor['vibration'] > 0.3:
                    alerts.append(Alert(
                        id=alert_id,
                        equipment_id=equipment['id'],
                        equipment_name=equipment['name'],
                        alert_type="High Vibration",
                        severity="Medium",
                        message=f"High vibration detected: {sensor['vibration']}",
                        timestamp=datetime.now().isoformat()
                    ))
                    alert_id += 1
                
                # Oil level alert
                if 'oil_level' in sensor and sensor['oil_level'] < 30:
                    alerts.append(Alert(
                        id=alert_id,
                        equipment_id=equipment['id'],
                        equipment_name=equipment['name'],
                        alert_type="Low Oil Level",
                        severity="High",
                        message=f"Low oil level detected: {sensor['oil_level']}%",
                        timestamp=datetime.now().isoformat()
                    ))
                    alert_id += 1
                
                # Efficiency alert
                if 'efficiency' in sensor and sensor['efficiency'] < 70:
                    alerts.append(Alert(
                        id=alert_id,
                        equipment_id=equipment['id'],
                        equipment_name=equipment['name'],
                        alert_type="Low Efficiency",
                        severity="Medium",
                        message=f"Low efficiency detected: {sensor['efficiency']}%",
                        timestamp=datetime.now().isoformat()
                    ))
                    alert_id += 1
        
        # Check for safety incidents
        if not usage_df.empty:
            today_usage = usage_df[usage_df['date'] == datetime.now().strftime('%Y-%m-%d')]
            for _, usage in today_usage.iterrows():
                if usage['safety_incidents'] > 0:
                    equipment = equipment_df[equipment_df['id'] == usage['equipment_id']].iloc[0]
                    alerts.append(Alert(
                        id=alert_id,
                        equipment_id=equipment['id'],
                        equipment_name=equipment['name'],
                        alert_type="Safety Incident",
                        severity="High",
                        message=f"Safety incident reported: {usage['safety_incidents']} incidents today",
                        timestamp=datetime.now().isoformat()
                    ))
                    alert_id += 1
        
        return alerts
    
    def get_usage_stats(self):
        usage_df = self.db.get_usage_data()
        today = datetime.now().strftime('%Y-%m-%d')
        
        if usage_df.empty:
            return {
                "today_usage": 0,
                "weekly_average": 0,
                "total_weekly_usage": 0
            }
        
        # Today's usage
        today_usage = usage_df[usage_df['date'] == today]['daily_usage_hours'].sum()
        
        # Weekly average
        week_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
        weekly_data = usage_df[usage_df['date'] >= week_ago]
        weekly_average = weekly_data['daily_usage_hours'].mean() if not weekly_data.empty else 0
        
        return {
            "today_usage": round(today_usage, 2),
            "weekly_average": round(weekly_average, 2),
            "total_weekly_usage": round(weekly_data['daily_usage_hours'].sum(), 2)
        }
    
    def get_maintenance_schedule(self):
        equipment_df = self.db.get_equipment()
        
        schedule = []
        for _, equipment in equipment_df.iterrows():
            due_date = equipment['next_maintenance']
            days_until_due = (datetime.strptime(due_date, '%Y-%m-%d') - datetime.now()).days
            
            if days_until_due <= 7:
                priority = "High"
            elif days_until_due <= 30:
                priority = "Medium"
            else:
                priority = "Low"
            
            schedule.append({
                "equipment_id": equipment['id'],
                "equipment_name": equipment['name'],
                "due_date": due_date,
                "days_until_due": days_until_due,
                "priority": priority
            })
        
        # Sort by priority and days until due
        schedule.sort(key=lambda x: (x['priority'] != 'High', x['priority'] != 'Medium', x['days_until_due']))
        return schedule
    
    def get_recent_activity(self):
        equipment_df = self.db.get_equipment()
        sensor_df = self.db.get_sensor_data()
        
        if sensor_df.empty:
            return []
        
        # Get latest sensor reading for each equipment
        latest_readings = sensor_df.groupby('equipment_id').last().reset_index()
        
        activity = []
        for _, reading in latest_readings.iterrows():
            equipment = equipment_df[equipment_df['id'] == reading['equipment_id']].iloc[0]
            
            activity.append({
                "equipment_id": equipment['id'],
                "equipment_name": equipment['name'],
                "activity_type": "Sensor Reading",
                "timestamp": reading['timestamp'],
                "status": equipment['status'],
                "temperature": reading['temperature'],
                "vibration": reading['vibration']
            })
        
        return sorted(activity, key=lambda x: x['timestamp'], reverse=True)[:10]
    
    def get_safety_alerts(self):
        """Get safety-related alerts"""
        equipment_df = self.db.get_equipment()
        usage_df = self.db.get_usage_data()
        
        safety_alerts = []
        alert_id = 1
        
        # Check for safety incidents
        if not usage_df.empty:
            today_usage = usage_df[usage_df['date'] == datetime.now().strftime('%Y-%m-%d')]
            for _, usage in today_usage.iterrows():
                if usage['safety_incidents'] > 0:
                    equipment = equipment_df[equipment_df['id'] == usage['equipment_id']].iloc[0]
                    safety_alerts.append({
                        "id": alert_id,
                        "equipment_id": equipment['id'],
                        "equipment_name": equipment['name'],
                        "alert_type": "Safety Incident",
                        "severity": "High",
                        "message": f"Safety incident reported: {usage['safety_incidents']} incidents today",
                        "timestamp": datetime.now().isoformat(),
                        "location": equipment['location'],
                        "action_required": "Immediate safety inspection required",
                        "resolved": False
                    })
                    alert_id += 1
        
        return safety_alerts
    
    def get_compliance_report(self):
        """Generate compliance report"""
        equipment_df = self.db.get_equipment()
        maintenance_df = self.db.get_maintenance_logs()
        
        total_equipment = len(equipment_df)
        compliant_equipment = len(equipment_df[equipment_df['status'] == 'Active'])
        non_compliant_equipment = len(equipment_df[equipment_df['status'].isin(['Warning', 'Critical'])])
        
        # Count overdue maintenance
        today = datetime.now()
        overdue_maintenance = 0
        for _, equipment in equipment_df.iterrows():
            next_maintenance = datetime.strptime(equipment['next_maintenance'], '%Y-%m-%d')
            if next_maintenance < today:
                overdue_maintenance += 1
        
        # Count expired warranties
        expired_warranties = 0
        for _, equipment in equipment_df.iterrows():
            if 'warranty_expiry' in equipment and equipment['warranty_expiry']:
                warranty_expiry = datetime.strptime(equipment['warranty_expiry'], '%Y-%m-%d')
                if warranty_expiry < today:
                    expired_warranties += 1
        
        # Calculate compliance score
        compliance_score = (compliant_equipment / total_equipment) * 100 if total_equipment > 0 else 0
        
        return {
            "report_date": today.strftime('%Y-%m-%d'),
            "total_equipment": total_equipment,
            "compliant_equipment": compliant_equipment,
            "non_compliant_equipment": non_compliant_equipment,
            "safety_violations": non_compliant_equipment,
            "maintenance_overdue": overdue_maintenance,
            "certification_expired": expired_warranties,
            "compliance_score": round(compliance_score, 2)
        }
    
    def get_energy_analytics(self):
        """Get energy consumption analytics"""
        usage_df = self.db.get_usage_data()
        
        if usage_df.empty:
            return {
                "total_energy": 0,
                "average_energy_per_equipment": 0,
                "energy_trend": "No data available",
                "top_consumers": []
            }
        
        total_energy = usage_df['energy_consumption'].sum()
        average_energy = usage_df['energy_consumption'].mean()
        
        # Get top energy consumers
        top_consumers = usage_df.nlargest(5, 'energy_consumption')[['equipment_id', 'energy_consumption']].to_dict('records')
        
        return {
            "total_energy": round(total_energy, 2),
            "average_energy_per_equipment": round(average_energy, 2),
            "energy_trend": "Stable" if average_energy < 10 else "High consumption",
            "top_consumers": top_consumers
        }