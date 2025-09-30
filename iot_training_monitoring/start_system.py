#!/usr/bin/env python3
"""
Startup script for IoT Training Monitoring System
"""

import subprocess
import sys
import os
import time
import webbrowser
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed"""
    print("🔍 Checking dependencies...")
    
    try:
        import fastapi
        import uvicorn
        import pandas
        import websockets
        print("✅ All required dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("📦 Installing dependencies...")
        
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
            print("✅ Dependencies installed successfully")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to install dependencies")
            return False

def generate_mock_data():
    """Generate mock data if it doesn't exist"""
    print("📊 Checking for mock data...")
    
    data_dir = Path("data")
    if not data_dir.exists():
        data_dir.mkdir()
        print("📁 Created data directory")
    
    # Check if data files exist
    required_files = ["equipment.csv", "sensor_data.csv", "maintenance_logs.csv", "usage_data.csv"]
    missing_files = [f for f in required_files if not (data_dir / f).exists()]
    
    if missing_files:
        print(f"📝 Generating mock data for: {', '.join(missing_files)}")
        try:
            # Import and run the mock data generator
            sys.path.append(str(Path.cwd() / "backend"))
            from mock_data_generator import generate_mock_data
            generate_mock_data()
            print("✅ Mock data generated successfully")
        except Exception as e:
            print(f"⚠️  Could not generate mock data: {e}")
            print("   The system will work with empty data files")
    else:
        print("✅ Mock data already exists")

def start_server():
    """Start the FastAPI server"""
    print("🚀 Starting IoT Training Monitoring Server...")
    
    # Change to backend directory
    backend_dir = Path("backend")
    if backend_dir.exists():
        os.chdir(backend_dir)
    
    try:
        # Start the server
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "main:app", 
            "--host", "127.0.0.1", 
            "--port", "8000", 
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Failed to start server: {e}")

def main():
    """Main startup function"""
    print("🏭 IoT Training Equipment Monitoring System")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        print("❌ Cannot start system due to missing dependencies")
        return
    
    # Generate mock data
    generate_mock_data()
    
    # Start server
    print("\n🌐 Server will be available at: http://localhost:8000")
    print("📱 Dashboard will be available at: http://localhost:8000/dashboard.html")
    print("🔌 WebSocket endpoint: ws://localhost:8000/ws")
    print("\n⏳ Starting server in 3 seconds...")
    print("   Press Ctrl+C to stop the server")
    
    time.sleep(3)
    
    # Open browser (optional)
    try:
        webbrowser.open("http://localhost:8000")
        print("🌐 Opening browser...")
    except:
        pass
    
    start_server()

if __name__ == "__main__":
    main()
