#!/usr/bin/env python3
"""
Simple test to verify data processing works
"""

from data_processor import DataProcessor
import json

def main():
    print("Testing data processor...")
    
    try:
        dp = DataProcessor()
        result = dp.get_overview_stats()
        
        print("Success! Overview stats:")
        print(json.dumps(result, indent=2))
        
        # Test equipment data
        from database import db
        equipment = db.get_equipment()
        print(f"\nEquipment count: {len(equipment)}")
        print(f"Active equipment: {len(equipment[equipment['status'] == 'Active'])}")
        print(f"Maintenance alerts: {len(equipment[equipment['status'].isin(['Warning', 'Critical'])])}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
