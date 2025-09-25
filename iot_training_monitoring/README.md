# IoT Training Equipment Monitoring System

A comprehensive IoT-enabled monitoring system for vocational training laboratories, featuring real-time equipment monitoring, predictive maintenance, safety alerts, and compliance reporting.

## 🚀 Features

### Core Functionality
- **Real-time Equipment Monitoring**: Live tracking of equipment status, temperature, vibration, power consumption, and usage hours
- **Predictive Maintenance**: AI-powered algorithms using machine learning to predict equipment failures and maintenance needs
- **Safety Monitoring**: Automated detection of unsafe usage patterns and safety incidents
- **Compliance Reporting**: Automated compliance tracking and reporting for safety standards
- **Energy Analytics**: Comprehensive energy consumption monitoring and optimization insights

### Advanced Features
- **Anomaly Detection**: Machine learning-based anomaly detection using Isolation Forest
- **Health Scoring**: Equipment health scoring system based on multiple sensor parameters
- **Real-time Alerts**: Instant notifications for critical issues and maintenance needs
- **Modern UI/UX**: Responsive, modern interface with dark mode support
- **Scalable Architecture**: Designed for diverse vocational training labs (ITIs, polytechnics, private training centers)

## 🏗️ Architecture

### Backend (FastAPI)
- **API Layer**: RESTful API with FastAPI framework
- **Data Processing**: Pandas-based data processing and analytics
- **Machine Learning**: Scikit-learn for predictive maintenance and anomaly detection
- **Database**: CSV-based data storage (easily replaceable with SQL database)

### Frontend (Vanilla JavaScript)
- **Modern UI**: Responsive design with CSS Grid and Flexbox
- **Real-time Updates**: WebSocket-like functionality with periodic API calls
- **Interactive Dashboard**: Dynamic charts and visualizations
- **Progressive Enhancement**: Works without JavaScript for basic functionality

## 📊 Data Structure

### Equipment Data (100+ records)
- Equipment details: ID, name, type, status, location
- Technical specifications: manufacturer, model, power rating, capacity
- Maintenance information: last maintenance, next maintenance, warranty expiry
- Cost tracking: maintenance cost, installation year

### Sensor Data (100+ records)
- Real-time metrics: temperature, vibration, power consumption, usage hours
- Environmental data: humidity, pressure, RPM, efficiency
- Condition monitoring: oil level, noise level

### Maintenance Logs (100+ records)
- Maintenance history: type, description, technician, status
- Cost tracking: maintenance cost, duration, parts replaced
- Scheduling: next due date, priority level

### Usage Data (100+ records)
- Daily usage tracking: hours, user count, energy consumption
- Cost analysis: cost per hour, maintenance hours, downtime
- Safety metrics: efficiency score, safety incidents

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.8 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r ../requirements.txt
   ```

3. Run the FastAPI server:
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:8000`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Open `index.html` in your web browser or serve it using a local server:
   ```bash
   # Using Python's built-in server
   python -m http.server 8001
   ```

3. Access the application at `http://localhost:8001`

## 🔧 API Endpoints

### Core Endpoints
- `GET /api/overview` - System overview statistics
- `GET /api/alerts` - Real-time alerts and notifications
- `GET /api/equipment` - Equipment list and details
- `GET /api/equipment/{id}` - Specific equipment details
- `GET /api/usage-stats` - Usage statistics and analytics

### Advanced Endpoints
- `GET /api/predict-maintenance/{id}` - Predictive maintenance analysis
- `GET /api/predict-failure/{id}` - Equipment failure prediction
- `GET /api/anomaly-detection` - Anomaly detection results
- `GET /api/equipment-health/{id}` - Equipment health scoring
- `GET /api/safety-alerts` - Safety-related alerts
- `GET /api/compliance-report` - Compliance reporting
- `GET /api/energy-analytics` - Energy consumption analytics

### Data Management
- `POST /api/sensor-data` - Add new sensor data
- `POST /api/maintenance-log` - Add maintenance log entry

## 🎯 Key Features Explained

### Predictive Maintenance
The system uses machine learning algorithms to predict equipment failures:
- **Random Forest Classifier**: Predicts failure risk based on sensor data
- **Isolation Forest**: Detects anomalies in equipment behavior
- **Health Scoring**: Calculates equipment health based on multiple parameters

### Safety Monitoring
Comprehensive safety features:
- **Incident Tracking**: Monitors safety incidents per equipment
- **Alert System**: Real-time alerts for safety violations
- **Compliance Scoring**: Automated compliance assessment

### Energy Analytics
Energy consumption monitoring:
- **Total Consumption**: Track overall energy usage
- **Per-Equipment Analysis**: Individual equipment energy consumption
- **Trend Analysis**: Energy usage patterns and optimization opportunities

## 🔒 Security & Compliance

### Data Privacy
- No personal data collection
- Equipment-focused monitoring only
- Local data storage (CSV files)

### Safety Standards
- Compliance with vocational training safety standards
- Automated safety incident reporting
- Maintenance schedule compliance tracking

## 📱 User Interface

### Dashboard Features
- **Real-time Status**: Live equipment status updates
- **Interactive Charts**: Visual representation of data
- **Alert Management**: Centralized alert handling
- **Responsive Design**: Works on desktop, tablet, and mobile

### Navigation
- **Home**: System overview and key metrics
- **Dashboard**: Detailed monitoring dashboard
- **Equipment**: Equipment management and details
- **Maintenance**: Maintenance scheduling and history
- **Analytics**: Advanced analytics and reporting

## 🚀 Deployment

### Production Deployment
1. **Database Migration**: Replace CSV files with SQL database
2. **Environment Variables**: Configure production settings
3. **Security Hardening**: Implement authentication and authorization
4. **Monitoring**: Add application monitoring and logging
5. **Scaling**: Implement load balancing for high availability

### Cloud Deployment
- **AWS**: Deploy using EC2, RDS, and S3
- **Azure**: Use Azure App Service and SQL Database
- **Google Cloud**: Deploy with Cloud Run and Cloud SQL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation for common issues

## 🔮 Future Enhancements

### Planned Features
- **Mobile App**: Native mobile application
- **IoT Integration**: Direct sensor integration
- **Advanced Analytics**: Machine learning insights
- **Multi-tenant Support**: Support for multiple training centers
- **API Integration**: Third-party system integration

### Technology Roadmap
- **Microservices Architecture**: Break down into microservices
- **Real-time Streaming**: Implement WebSocket connections
- **Advanced ML**: Deep learning models for prediction
- **Cloud Native**: Kubernetes deployment
- **Edge Computing**: Local processing capabilities

---

**Built with ❤️ for vocational training excellence**