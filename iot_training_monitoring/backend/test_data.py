#!/usr/bin/env python3
"""
Test script to debug data processing issues
"""

import pandas as pd
import os
from database import db
from data_processor import DataProcessor

def test_data_loading():
    """Test data loading from CSV files"""
    print("Testing data loading...")
    
    try:
        # Test equipment data
        equipment_df = db.get_equipment()
        print(f"Equipment data shape: {equipment_df.shape}")
        print(f"Equipment columns: {list(equipment_df.columns)}")
        print(f"Equipment status values: {equipment_df['status'].unique()}")
        
        # Test sensor data
        sensor_df = db.get_sensor_data()
        print(f"Sensor data shape: {sensor_df.shape}")
        print(f"Sensor columns: {list(sensor_df.columns)}")
        
        # Test usage data
        usage_df = db.get_usage_data()
        print(f"Usage data shape: {usage_df.shape}")
        print(f"Usage columns: {list(usage_df.columns)}")
        
        # Test maintenance data
        maintenance_df = db.get_maintenance_logs()
        print(f"Maintenance data shape: {maintenance_df.shape}")
        print(f"Maintenance columns: {list(maintenance_df.columns)}")
        
        return True
        
    except Exception as e:
        print(f"Error loading data: {e}")
        return False

def test_data_processor():
    """Test data processor"""
    print("\nTesting data processor...")
    
    try:
        processor = DataProcessor()
        overview = processor.get_overview_stats()
        print(f"Overview stats: {overview}")
        return True
        
    except Exception as e:
        print(f"Error in data processor: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_equipment_status():
    """Test equipment status calculation"""
    print("\nTesting equipment status...")
    
    try:
        equipment_df = db.get_equipment()
        total_equipment = len(equipment_df)
        active_equipment = len(equipment_df[equipment_df['status'] == 'Active'])
        maintenance_alerts = len(equipment_df[equipment_df['status'].isin(['Warning', 'Critical'])])
        
        print(f"Total equipment: {total_equipment}")
        print(f"Active equipment: {active_equipment}")
        print(f"Maintenance alerts: {maintenance_alerts}")
        
        return True
        
    except Exception as e:
        print(f"Error calculating equipment status: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Starting data tests...")
    
    # Test data loading
    if not test_data_loading():
        print("Data loading failed!")
        exit(1)
    
    # Test equipment status
    if not test_equipment_status():
        print("Equipment status calculation failed!")
        exit(1)
    
    # Test data processor
    if not test_data_processor():
        print("Data processor failed!")
        exit(1)
    
    print("\nAll tests passed!")