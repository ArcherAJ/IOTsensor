#!/usr/bin/env python3
"""
Debug script to test data loading and processing
"""

from database import db
from data_processor import DataProcessor
import pandas as pd

def test_data_loading():
    print("=== Testing Data Loading ===")
    
    # Test database loading
    equipment_df = db.get_equipment()
    sensor_df = db.get_sensor_data()
    usage_df = db.get_usage_data()
    maintenance_df = db.get_maintenance_logs()
    
    print(f"Equipment records: {len(equipment_df)}")
    print(f"Sensor records: {len(sensor_df)}")
    print(f"Usage records: {len(usage_df)}")
    print(f"Maintenance records: {len(maintenance_df)}")
    
    if not equipment_df.empty:
        print(f"Sample equipment: {equipment_df.iloc[0]['name']}")
        print(f"Equipment statuses: {equipment_df['status'].value_counts().to_dict()}")
    
    if not sensor_df.empty:
        print(f"Sample sensor data: {sensor_df.iloc[0]['temperature']}°C")
        print(f"Temperature range: {sensor_df['temperature'].min()} - {sensor_df['temperature'].max()}")
    
    # Test data processor
    print("\n=== Testing Data Processor ===")
    try:
        processor = DataProcessor()
        stats = processor.get_overview_stats()
        print("Overview stats:", stats)
        
        # Test individual calculations
        total_equipment = len(equipment_df)
        active_equipment = len(equipment_df[equipment_df['status'] == 'Active'])
        maintenance_alerts = len(equipment_df[equipment_df['status'].isin(['Warning', 'Critical'])])
        
        print(f"Manual calculation:")
        print(f"  Total equipment: {total_equipment}")
        print(f"  Active equipment: {active_equipment}")
        print(f"  Maintenance alerts: {maintenance_alerts}")
        
        if not sensor_df.empty:
            total_usage_hours = sensor_df['usage_hours'].sum()
            print(f"  Total usage hours: {total_usage_hours}")
        
        if not usage_df.empty:
            total_energy = usage_df['energy_consumption'].sum()
            print(f"  Total energy: {total_energy}")
        
    except Exception as e:
        print(f"Error in data processor: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_data_loading()
