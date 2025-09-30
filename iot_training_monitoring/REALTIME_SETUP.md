# IoT Training Equipment Monitoring System - Real-time Setup

## 🚀 Quick Start

### 1. Start the System
```bash
cd iot_training_monitoring
python start_system.py
```

### 2. Access the Dashboard
- **Main Dashboard**: http://localhost:8000/dashboard.html
- **API Documentation**: http://localhost:8000/docs
- **WebSocket Endpoint**: ws://localhost:8000/ws

### 3. Test Real-time Functionality
```bash
python test_realtime.py
```

## 🔧 Real-time Features

### WebSocket Connection
- **Endpoint**: `ws://localhost:8000/ws`
- **Update Frequency**: Every 3 seconds
- **Data Types**: Equipment status, sensor readings, alerts, activity logs

### Real-time Data Flow
1. **Background Data Generator**: Continuously generates new sensor data every 10 seconds
2. **WebSocket Server**: Broadcasts real-time updates to connected clients
3. **Frontend Dashboard**: Receives and displays live data updates
4. **Connection Management**: Automatic reconnection with exponential backoff

### Data Updates Include:
- **Overview Statistics**: Equipment counts, uptime, alerts
- **Sensor Data**: Temperature, vibration, power consumption, efficiency
- **Equipment Status**: Real-time status changes
- **Alerts**: New alerts and notifications
- **Recent Activity**: Latest equipment activities

## 📊 Dashboard Features

### Real-time Indicators
- **Connection Status**: Shows WebSocket connection state
- **Live Updates**: All metrics update automatically
- **Alert Notifications**: Real-time alert display
- **Equipment Status**: Live equipment status changes

### Charts and Visualizations
- **Performance Charts**: Real-time efficiency and temperature trends
- **Energy Consumption**: Live power usage monitoring
- **Status Distribution**: Equipment status pie charts
- **Maintenance Schedule**: Upcoming maintenance alerts

## 🔌 API Endpoints

### Core Data Endpoints
- `GET /api/overview` - System overview statistics
- `GET /api/equipment` - Equipment list and status
- `GET /api/alerts` - Current alerts and notifications
- `GET /api/sensor-data` - Latest sensor readings

### Chart Data Endpoints
- `GET /api/chart-data/performance` - Performance metrics
- `GET /api/chart-data/energy` - Energy consumption data
- `GET /api/chart-data/status` - Equipment status distribution
- `GET /api/chart-data/temperature` - Temperature trends
- `GET /api/chart-data/efficiency` - Efficiency metrics

### Real-time Endpoints
- `WebSocket /ws` - Real-time data stream
- `POST /api/sensor-data` - Add new sensor data
- `POST /api/maintenance-log` - Log maintenance activities

## 🛠️ Technical Architecture

### Backend Components
- **FastAPI**: Modern Python web framework
- **WebSocket**: Real-time bidirectional communication
- **Pandas**: Data processing and analysis
- **Background Tasks**: Continuous data generation
- **CSV Database**: Lightweight data storage

### Frontend Components
- **Vanilla JavaScript**: No framework dependencies
- **WebSocket Client**: Real-time data consumption
- **Chart.js**: Interactive data visualizations
- **Responsive Design**: Mobile-friendly interface

### Data Flow
```
Background Generator → CSV Files → Data Processor → WebSocket Server → Frontend Dashboard
```

## 🔍 Monitoring and Debugging

### Connection Status
- **Green Indicator**: WebSocket connected
- **Red Indicator**: Connection lost
- **Yellow Indicator**: Reconnecting

### Console Logs
- **Backend**: Server logs in terminal
- **Frontend**: Browser developer console
- **WebSocket**: Connection status and message logs

### Test Script
The `test_realtime.py` script provides:
- WebSocket connection testing
- API endpoint validation
- Real-time data flow verification
- Performance monitoring

## 🚨 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check if server is running on port 8000
   - Verify firewall settings
   - Check browser console for errors

2. **No Real-time Updates**
   - Verify WebSocket connection status
   - Check if background data generator is running
   - Ensure CSV files exist in data/ directory

3. **Charts Not Updating**
   - Check if Chart.js is loaded
   - Verify WebSocket data format
   - Check browser console for JavaScript errors

### Performance Optimization
- **Data Caching**: 30-second TTL for API responses
- **Connection Pooling**: Efficient WebSocket management
- **Background Tasks**: Non-blocking data generation
- **Frontend Optimization**: Efficient DOM updates

## 📈 Scaling Considerations

### For Production Use
- **Database**: Replace CSV with PostgreSQL/MongoDB
- **Message Queue**: Use Redis for real-time data
- **Load Balancing**: Multiple server instances
- **Monitoring**: Add comprehensive logging and metrics

### Performance Tuning
- **WebSocket Limits**: Configure connection limits
- **Data Frequency**: Adjust update intervals
- **Caching Strategy**: Implement Redis caching
- **CDN**: Use CDN for static assets

## 🔐 Security Considerations

### Current Implementation
- **CORS**: Configured for development
- **Data Validation**: Pydantic models
- **Error Handling**: Comprehensive exception handling

### Production Security
- **Authentication**: Add user authentication
- **Authorization**: Role-based access control
- **HTTPS**: Enable SSL/TLS encryption
- **Rate Limiting**: Implement API rate limits

## 📝 Development Notes

### Adding New Real-time Features
1. **Backend**: Add new data fields to WebSocket message
2. **Frontend**: Update JavaScript handlers
3. **Testing**: Verify with test script
4. **Documentation**: Update this README

### Data Model Extensions
- **Equipment**: Add new equipment types
- **Sensors**: Add new sensor types
- **Alerts**: Customize alert rules
- **Analytics**: Add new metrics

## 🎯 Next Steps

1. **Enhanced Analytics**: Add predictive maintenance
2. **Mobile App**: React Native or Flutter app
3. **IoT Integration**: Connect real sensors
4. **Machine Learning**: Add anomaly detection
5. **Cloud Deployment**: Deploy to AWS/Azure

---

**Happy Monitoring! 🚀**
