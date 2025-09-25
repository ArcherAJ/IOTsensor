import pandas as pd
import os

class CSVDatabase:
    def __init__(self):
        self.data_dir = "data"
        self.equipment_file = os.path.join(self.data_dir, "equipment.csv")
        self.sensor_data_file = os.path.join(self.data_dir, "sensor_data.csv")
        self.maintenance_file = os.path.join(self.data_dir, "maintenance_logs.csv")
        self.usage_file = os.path.join(self.data_dir, "usage_data.csv")
        
        # Create data directory if it doesn't exist
        os.makedirs(self.data_dir, exist_ok=True)
        
        # Initialize CSV files with headers if they don't exist
        self.initialize_files()
    
    def initialize_files(self):
        # Only create files if they don't exist - mock data generator will create them with proper headers
        pass
    
    def read_csv(self, file_path):
        try:
            return pd.read_csv(file_path)
        except (pd.errors.EmptyDataError, FileNotFoundError):
            return pd.DataFrame()
    
    def write_csv(self, file_path, df):
        df.to_csv(file_path, index=False)
    
    def get_equipment(self):
        return self.read_csv(self.equipment_file)
    
    def get_sensor_data(self):
        return self.read_csv(self.sensor_data_file)
    
    def get_maintenance_logs(self):
        return self.read_csv(self.maintenance_file)
    
    def get_usage_data(self):
        return self.read_csv(self.usage_file)
    
    def add_sensor_data(self, sensor_data):
        df = self.get_sensor_data()
        new_df = pd.DataFrame([sensor_data.dict()])
        updated_df = pd.concat([df, new_df], ignore_index=True)
        self.write_csv(self.sensor_data_file, updated_df)
    
    def add_maintenance_log(self, maintenance_log):
        df = self.get_maintenance_logs()
        new_df = pd.DataFrame([maintenance_log.dict()])
        updated_df = pd.concat([df, new_df], ignore_index=True)
        self.write_csv(self.maintenance_file, updated_df)

# Global database instance
db = CSVDatabase()