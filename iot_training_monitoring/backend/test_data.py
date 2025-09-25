#!/usr/bin/env python3
"""
Test script to verify data loading and API functionality
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import db
from data_processor import DataProcessor
import pandas as pd

def test_data_loading():
    print("Testing data loading...")
    
    # Test equipment data
    print("\n1. Testing Equipment Data:")
    equipment_df = db.get_equipment()
    print(f"   Equipment records: {len(equipment_df)}")
    if not equipment_df.empty:
        print(f"   Sample equipment: {equipment_df.iloc[0]['name']}")
        print(f"   Columns: {list(equipment_df.columns)}")
    else:
        print("   ERROR: No equipment data found!")
    
    # Test sensor data
    print("\n2. Testing Sensor Data:")
    sensor_df = db.get_sensor_data()
    print(f"   Sensor records: {len(sensor_df)}")
    if not sensor_df.empty:
        print(f"   Sample temperature: {sensor_df.iloc[0]['temperature']}")
        print(f"   Columns: {list(sensor_df.columns)}")
    else:
        print("   ERROR: No sensor data found!")
    
    # Test usage data
    print("\n3. Testing Usage Data:")
    usage_df = db.get_usage_data()
    print(f"   Usage records: {len(usage_df)}")
    if not usage_df.empty:
        print(f"   Sample usage hours: {usage_df.iloc[0]['daily_usage_hours']}")
        print(f"   Columns: {list(usage_df.columns)}")
    else:
        print("   ERROR: No usage data found!")
    
    # Test maintenance data
    print("\n4. Testing Maintenance Data:")
    maintenance_df = db.get_maintenance_logs()
    print(f"   Maintenance records: {len(maintenance_df)}")
    if not maintenance_df.empty:
        print(f"   Sample maintenance: {maintenance_df.iloc[0]['maintenance_type']}")
        print(f"   Columns: {list(maintenance_df.columns)}")
    else:
        print("   ERROR: No maintenance data found!")
    
    # Test data processor
    print("\n5. Testing Data Processor:")
    processor = DataProcessor()
    overview_stats = processor.get_overview_stats()
    print(f"   Overview stats: {overview_stats}")
    
    return len(equipment_df) > 0 and len(sensor_df) > 0 and len(usage_df) > 0

if __name__ == "__main__":
    print("=== IoT Lab Monitor Data Loading Test ===")
    success = test_data_loading()
    
    if success:
        print("\n✅ All data loaded successfully!")
        print("✅ Server should work properly now!")
    else:
        print("\n❌ Data loading failed!")
        print("❌ Check the data files and database configuration!")
    
    print("\n=== Test Complete ===")
