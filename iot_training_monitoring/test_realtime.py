#!/usr/bin/env python3
"""
Test script for real-time IoT monitoring system
"""

import asyncio
import websockets
import json
import time
from datetime import datetime

async def test_websocket_connection():
    """Test WebSocket connection and real-time data flow"""
    uri = "ws://localhost:8000/ws"
    
    try:
        print("🔌 Connecting to WebSocket...")
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket connected successfully!")
            
            # Listen for messages for 30 seconds
            timeout = 30
            start_time = time.time()
            message_count = 0
            
            print(f"📡 Listening for real-time updates for {timeout} seconds...")
            
            while time.time() - start_time < timeout:
                try:
                    # Wait for message with timeout
                    message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    data = json.loads(message)
                    message_count += 1
                    
                    print(f"\n📨 Message #{message_count} received at {datetime.now().strftime('%H:%M:%S')}")
                    print(f"   Type: {data.get('type', 'unknown')}")
                    
                    if data.get('type') == 'real_time_update':
                        overview = data.get('overview_stats', {})
                        alerts = data.get('alerts', [])
                        sensor_data = data.get('sensor_data', [])
                        equipment_status = data.get('equipment_status', [])
                        
                        print(f"   📊 Overview Stats:")
                        print(f"      - Total Equipment: {overview.get('total_equipment', 0)}")
                        print(f"      - Active Equipment: {overview.get('active_equipment', 0)}")
                        print(f"      - Maintenance Alerts: {overview.get('maintenance_alerts', 0)}")
                        print(f"      - Uptime: {overview.get('uptime_percentage', 0)}%")
                        
                        print(f"   🚨 Alerts: {len(alerts)}")
                        for alert in alerts[:3]:  # Show first 3 alerts
                            print(f"      - {alert.get('equipment_name', 'Unknown')}: {alert.get('message', 'No message')}")
                        
                        print(f"   📡 Sensor Data: {len(sensor_data)} readings")
                        for sensor in sensor_data[:3]:  # Show first 3 sensors
                            print(f"      - Equipment {sensor.get('equipment_id', 'Unknown')}: "
                                  f"Temp={sensor.get('temperature', 0)}°C, "
                                  f"Efficiency={sensor.get('efficiency', 0)}%")
                        
                        print(f"   🏭 Equipment Status: {len(equipment_status)} items")
                        for eq in equipment_status[:3]:  # Show first 3 equipment
                            print(f"      - {eq.get('name', 'Unknown')}: {eq.get('status', 'Unknown')}")
                        
                        print(f"   👥 Active Connections: {data.get('active_connections', 0)}")
                    
                except asyncio.TimeoutError:
                    print("⏰ No message received in 5 seconds, continuing...")
                    continue
                except Exception as e:
                    print(f"❌ Error processing message: {e}")
                    continue
            
            print(f"\n✅ Test completed! Received {message_count} messages in {timeout} seconds")
            
    except ConnectionRefusedError:
        print("❌ Connection refused. Make sure the server is running on localhost:8000")
    except Exception as e:
        print(f"❌ WebSocket connection failed: {e}")

async def test_api_endpoints():
    """Test API endpoints for data availability"""
    import aiohttp
    
    endpoints = [
        "/api/overview",
        "/api/alerts", 
        "/api/equipment",
        "/api/chart-data/performance",
        "/api/chart-data/energy",
        "/api/chart-data/status"
    ]
    
    print("\n🌐 Testing API endpoints...")
    
    async with aiohttp.ClientSession() as session:
        for endpoint in endpoints:
            try:
                url = f"http://localhost:8000{endpoint}"
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        print(f"✅ {endpoint}: OK ({len(str(data))} bytes)")
                    else:
                        print(f"❌ {endpoint}: HTTP {response.status}")
            except Exception as e:
                print(f"❌ {endpoint}: {e}")

async def main():
    """Main test function"""
    print("🚀 Starting IoT Real-time Monitoring System Test")
    print("=" * 50)
    
    # Test API endpoints first
    await test_api_endpoints()
    
    # Test WebSocket connection
    await test_websocket_connection()
    
    print("\n🎉 Test completed!")

if __name__ == "__main__":
    asyncio.run(main())
