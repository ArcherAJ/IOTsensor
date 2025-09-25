import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import os

class MockDataGenerator:
    def __init__(self):
        self.data_dir = "data"
        self.ensure_data_directory()
        
    def ensure_data_directory(self):
        """Create data directory if it doesn't exist"""
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
    
    def generate_equipment_data(self, num_equipment=25):
        """Generate realistic equipment data"""
        equipment_types = [
            "CNC Machine", "Robotic Arm", "Conveyor Belt", "Control Panel", 
            "Quality Station", "Welding Station", "Assembly Line", "Packaging Machine",
            "Inspection Camera", "Laser Cutter", "3D Printer", "Drill Press",
            "Lathe Machine", "Milling Machine", "Grinder", "Press Machine"
        ]
        
        locations = [
            "Manufacturing Lab A", "Manufacturing Lab B", "Training Room 1", 
            "Training Room 2", "Maintenance Bay", "Quality Control Area",
            "Assembly Floor", "Packaging Area", "Research Lab", "Prototype Lab"
        ]
        
        statuses = ["Active", "Idle", "Maintenance", "Warning", "Critical"]
        status_weights = [0.6, 0.2, 0.1, 0.08, 0.02]  # Most equipment active
        
        equipment_data = []
        for i in range(1, num_equipment + 1):
            equipment_type = random.choice(equipment_types)
            location = random.choice(locations)
            status = np.random.choice(statuses, p=status_weights)
            
            # Generate realistic maintenance dates
            next_maintenance = datetime.now() + timedelta(days=random.randint(1, 90))
            last_maintenance = datetime.now() - timedelta(days=random.randint(1, 30))
            
            # Generate warranty expiry (some equipment might be out of warranty)
            warranty_expiry = datetime.now() + timedelta(days=random.randint(-365, 1095))
            
            equipment_data.append({
                'id': i,
                'name': f"{equipment_type} #{i:02d}",
                'type': equipment_type,
                'location': location,
                'status': status,
                'manufacturer': random.choice(['Siemens', 'ABB', 'Fanuc', 'KUKA', 'Universal Robots', 'Festo']),
                'model': f"MODEL-{random.randint(1000, 9999)}",
                'serial_number': f"SN{random.randint(100000, 999999)}",
                'purchase_date': (datetime.now() - timedelta(days=random.randint(30, 1095))).strftime('%Y-%m-%d'),
                'warranty_expiry': warranty_expiry.strftime('%Y-%m-%d'),
                'next_maintenance': next_maintenance.strftime('%Y-%m-%d'),
                'last_maintenance': last_maintenance.strftime('%Y-%m-%d'),
                'maintenance_cost': round(random.uniform(500, 5000), 2),
                'energy_rating': random.choice(['A', 'B', 'C', 'D']),
                'safety_certification': random.choice(['ISO 9001', 'ISO 14001', 'OHSAS 18001', 'CE']),
                'training_required': random.choice(['Basic', 'Intermediate', 'Advanced']),
                'max_capacity': random.randint(10, 1000),
                'current_load': random.randint(0, 100),
                'efficiency': round(random.uniform(70, 95), 2)
            })
        
        df = pd.DataFrame(equipment_data)
        df.to_csv(f"{self.data_dir}/equipment.csv", index=False)
        return df
    
    def generate_sensor_data(self, num_readings=1000):
        """Generate realistic sensor data"""
        equipment_df = pd.read_csv(f"{self.data_dir}/equipment.csv")
        equipment_ids = equipment_df['id'].tolist()
        
        sensor_data = []
        for i in range(num_readings):
            equipment_id = random.choice(equipment_ids)
            equipment = equipment_df[equipment_df['id'] == equipment_id].iloc[0]
            
            # Generate timestamp (last 30 days)
            timestamp = datetime.now() - timedelta(
                days=random.randint(0, 30),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
            
            # Generate realistic sensor values based on equipment status
            if equipment['status'] == 'Active':
                temperature = random.uniform(25, 45)
                vibration = random.uniform(0.1, 0.3)
                power_consumption = random.uniform(50, 200)
                efficiency = random.uniform(80, 95)
            elif equipment['status'] == 'Warning':
                temperature = random.uniform(45, 60)
                vibration = random.uniform(0.3, 0.5)
                power_consumption = random.uniform(200, 300)
                efficiency = random.uniform(60, 80)
            elif equipment['status'] == 'Critical':
                temperature = random.uniform(60, 80)
                vibration = random.uniform(0.5, 1.0)
                power_consumption = random.uniform(300, 500)
                efficiency = random.uniform(40, 60)
            else:  # Idle or Maintenance
                temperature = random.uniform(20, 30)
                vibration = random.uniform(0.0, 0.1)
                power_consumption = random.uniform(10, 50)
                efficiency = random.uniform(90, 100)
            
            sensor_data.append({
                'id': i + 1,
                'equipment_id': equipment_id,
                'timestamp': timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                'temperature': round(temperature, 2),
                'vibration': round(vibration, 3),
                'power_consumption': round(power_consumption, 2),
                'oil_level': round(random.uniform(20, 100), 1),
                'pressure': round(random.uniform(1, 10), 2),
                'humidity': round(random.uniform(30, 70), 1),
                'efficiency': round(efficiency, 2),
                'usage_hours': round(random.uniform(0.5, 8), 2),
                'error_code': random.choice([0, 0, 0, 0, 101, 102, 103])  # Mostly no errors
            })
        
        df = pd.DataFrame(sensor_data)
        df.to_csv(f"{self.data_dir}/sensor_data.csv", index=False)
        return df
    
    def generate_usage_data(self, num_days=30):
        """Generate usage data for the last 30 days"""
        equipment_df = pd.read_csv(f"{self.data_dir}/equipment.csv")
        equipment_ids = equipment_df['id'].tolist()
        
        usage_data = []
        for day_offset in range(num_days):
            date = datetime.now() - timedelta(days=day_offset)
            date_str = date.strftime('%Y-%m-%d')
            
            for equipment_id in equipment_ids:
                equipment = equipment_df[equipment_df['id'] == equipment_id].iloc[0]
                
                # Generate realistic daily usage
                if equipment['status'] == 'Active':
                    daily_hours = random.uniform(6, 12)
                    energy_consumption = daily_hours * random.uniform(15, 25)
                    safety_incidents = random.choice([0, 0, 0, 0, 1])  # Rare incidents
                elif equipment['status'] == 'Idle':
                    daily_hours = random.uniform(0, 2)
                    energy_consumption = daily_hours * random.uniform(5, 10)
                    safety_incidents = 0
                else:  # Maintenance, Warning, Critical
                    daily_hours = random.uniform(0, 1)
                    energy_consumption = daily_hours * random.uniform(10, 20)
                    safety_incidents = random.choice([0, 0, 1, 2])  # More incidents for problematic equipment
                
                usage_data.append({
                    'id': len(usage_data) + 1,
                    'equipment_id': equipment_id,
                    'date': date_str,
                    'daily_usage_hours': round(daily_hours, 2),
                    'energy_consumption': round(energy_consumption, 2),
                    'cost_per_hour': round(random.uniform(10, 50), 2),
                    'safety_incidents': safety_incidents,
                    'operator_id': random.randint(1, 10),
                    'shift': random.choice(['Morning', 'Afternoon', 'Night']),
                    'productivity_score': round(random.uniform(70, 95), 2),
                    'quality_score': round(random.uniform(80, 100), 2)
                })
        
        df = pd.DataFrame(usage_data)
        df.to_csv(f"{self.data_dir}/usage_data.csv", index=False)
        return df
    
    def generate_maintenance_logs(self, num_logs=50):
        """Generate maintenance logs"""
        equipment_df = pd.read_csv(f"{self.data_dir}/equipment.csv")
        equipment_ids = equipment_df['id'].tolist()
        
        maintenance_types = [
            "Preventive Maintenance", "Corrective Maintenance", "Emergency Repair",
            "Calibration", "Cleaning", "Inspection", "Replacement", "Upgrade"
        ]
        
        technicians = [
            "John Smith", "Sarah Johnson", "Mike Wilson", "Lisa Brown", 
            "David Davis", "Emma Miller", "Tom Anderson", "Amy Taylor"
        ]
        
        maintenance_data = []
        for i in range(num_logs):
            equipment_id = random.choice(equipment_ids)
            maintenance_date = datetime.now() - timedelta(days=random.randint(1, 90))
            
            maintenance_data.append({
                'id': i + 1,
                'equipment_id': equipment_id,
                'maintenance_date': maintenance_date.strftime('%Y-%m-%d'),
                'maintenance_type': random.choice(maintenance_types),
                'description': f"Maintenance performed on {equipment_df[equipment_df['id'] == equipment_id].iloc[0]['name']}",
                'technician': random.choice(technicians),
                'duration_hours': round(random.uniform(1, 8), 2),
                'cost': round(random.uniform(200, 2000), 2),
                'parts_replaced': random.choice(['None', 'Filter', 'Belt', 'Sensor', 'Motor', 'Multiple parts']),
                'status': random.choice(['Completed', 'In Progress', 'Scheduled']),
                'next_maintenance_due': (maintenance_date + timedelta(days=random.randint(30, 90))).strftime('%Y-%m-%d'),
                'notes': f"Maintenance completed successfully. Equipment functioning normally."
            })
        
        df = pd.DataFrame(maintenance_data)
        df.to_csv(f"{self.data_dir}/maintenance_logs.csv", index=False)
        return df
    
    def generate_all_data(self):
        """Generate all mock data"""
        print("Generating mock data...")
        
        print("Generating equipment data...")
        equipment_df = self.generate_equipment_data()
        
        print("Generating sensor data...")
        sensor_df = self.generate_sensor_data()
        
        print("Generating usage data...")
        usage_df = self.generate_usage_data()
        
        print("Generating maintenance logs...")
        maintenance_df = self.generate_maintenance_logs()
        
        print(f"Mock data generation complete!")
        print(f"- Equipment: {len(equipment_df)} records")
        print(f"- Sensor Data: {len(sensor_df)} records")
        print(f"- Usage Data: {len(usage_df)} records")
        print(f"- Maintenance Logs: {len(maintenance_df)} records")
        
        return {
            'equipment': equipment_df,
            'sensor_data': sensor_df,
            'usage_data': usage_df,
            'maintenance_logs': maintenance_df
        }

if __name__ == "__main__":
    generator = MockDataGenerator()
    generator.generate_all_data()
