class EquipmentMonitoring {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8000';
        this.wsConnection = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.equipmentData = [];
        this.alerts = [];
        this.safetyViolations = [];
        this.init();
    }

    async init() {
        try {
            // Use simulated data instead of WebSocket for now
            this.simulateRealTimeData();
            this.setupEventListeners();
            this.showNotification('Equipment monitoring initialized', 'success');
            
            // Set up periodic updates
            setInterval(() => {
                this.simulateRealTimeData();
            }, 3000);
            
        } catch (error) {
            console.error('Error initializing equipment monitoring:', error);
            this.showNotification('Failed to initialize monitoring', 'error');
        }
    }

    connectWebSocket() {
        try {
            const wsUrl = `ws://localhost:8000/ws/equipment-monitoring`;
            this.wsConnection = new WebSocket(wsUrl);
            
            this.wsConnection.onopen = () => {
                console.log('WebSocket connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.updateConnectionStatus('connected');
                this.showNotification('Real-time monitoring connected', 'success');
            };
            
            this.wsConnection.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
            
            this.wsConnection.onclose = () => {
                console.log('WebSocket disconnected');
                this.isConnected = false;
                this.updateConnectionStatus('disconnected');
                this.attemptReconnect();
            };
            
            this.wsConnection.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.updateConnectionStatus('disconnected');
            };
            
        } catch (error) {
            console.error('Error connecting to WebSocket:', error);
            this.updateConnectionStatus('disconnected');
            this.attemptReconnect();
        }
    }

    handleWebSocketMessage(data) {
        if (data.type === 'equipment_monitoring_update') {
            this.updateEquipmentData(data);
            this.updateStatusSummary(data.summary);
            this.updateAlerts(data.alerts);
            this.updateSafetyViolations(data.safety_violations);
            this.updateLastUpdated(data.timestamp);
        }
    }

    // Simulate real-time data updates
    simulateRealTimeData() {
        const mockData = {
            type: 'equipment_monitoring_update',
            timestamp: new Date().toISOString(),
            summary: {
                total_equipment: 30,
                optimal: 8,
                warning: 2,
                critical: 1,
                failure: 0,
                offline: 0,
                health_percentage: 26.7
            },
            equipment_status: [
                {
                    id: 1,
                    name: "CNC Machine #01",
                    type: "CNC Machine",
                    location: "Manufacturing Lab A",
                    status: "optimal",
                    health_score: 85.5,
                    last_updated: new Date().toISOString(),
                    sensor_readings: {
                        temperature: 35.2,
                        vibration: 0.15,
                        pressure: 95.5,
                        efficiency: 87.3,
                        power_consumption: 150.2
                    },
                    alerts: [],
                    safety_violations: []
                },
                {
                    id: 2,
                    name: "Robotic Arm #02",
                    type: "Robotic Arm",
                    location: "Manufacturing Lab B",
                    status: "warning",
                    health_score: 65.2,
                    last_updated: new Date().toISOString(),
                    sensor_readings: {
                        temperature: 42.1,
                        vibration: 0.25,
                        pressure: 88.3,
                        efficiency: 72.1,
                        power_consumption: 180.5
                    },
                    alerts: [
                        {
                            type: "efficiency",
                            severity: "warning",
                            message: "Equipment efficiency is 72.1% - performance degradation detected"
                        }
                    ],
                    safety_violations: []
                },
                {
                    id: 3,
                    name: "Conveyor Belt #03",
                    type: "Conveyor Belt",
                    location: "Assembly Floor",
                    status: "critical",
                    health_score: 45.8,
                    last_updated: new Date().toISOString(),
                    sensor_readings: {
                        temperature: 55.7,
                        vibration: 0.45,
                        pressure: 75.2,
                        efficiency: 58.9,
                        power_consumption: 220.1
                    },
                    alerts: [
                        {
                            type: "health",
                            severity: "critical",
                            message: "Equipment health score is 45.8% - immediate attention required"
                        },
                        {
                            type: "efficiency",
                            severity: "warning",
                            message: "Equipment efficiency is 58.9% - performance degradation detected"
                        }
                    ],
                    safety_violations: [
                        {
                            type: "temperature",
                            severity: "critical",
                            message: "Equipment temperature (55.7°C) exceeds safety limit (60°C)"
                        }
                    ]
                }
            ],
            alerts: [
                {
                    equipment_id: 2,
                    equipment_name: "Robotic Arm #02",
                    equipment_location: "Manufacturing Lab B",
                    alert: {
                        type: "efficiency",
                        severity: "warning",
                        message: "Equipment efficiency is 72.1% - performance degradation detected"
                    },
                    timestamp: new Date().toISOString()
                },
                {
                    equipment_id: 3,
                    equipment_name: "Conveyor Belt #03",
                    equipment_location: "Assembly Floor",
                    alert: {
                        type: "health",
                        severity: "critical",
                        message: "Equipment health score is 45.8% - immediate attention required"
                    },
                    timestamp: new Date().toISOString()
                }
            ],
            safety_violations: [
                {
                    equipment_id: 3,
                    equipment_name: "Conveyor Belt #03",
                    equipment_location: "Assembly Floor",
                    violation: {
                        type: "temperature",
                        severity: "critical",
                        message: "Equipment temperature (55.7°C) exceeds safety limit (60°C)"
                    },
                    timestamp: new Date().toISOString()
                }
            ],
            critical_count: 1,
            safety_violation_count: 1
        };

        this.handleWebSocketMessage(mockData);
    }

    updateEquipmentData(data) {
        this.equipmentData = data.equipment_status || [];
        this.renderEquipmentGrid();
    }

    updateStatusSummary(summary) {
        document.getElementById('optimalCount').textContent = summary.optimal || 0;
        document.getElementById('warningCount').textContent = summary.warning || 0;
        document.getElementById('criticalCount').textContent = summary.critical || 0;
        document.getElementById('failureCount').textContent = summary.failure || 0;
        document.getElementById('offlineCount').textContent = summary.offline || 0;
    }

    updateAlerts(alerts) {
        this.alerts = alerts || [];
        this.renderCriticalAlerts();
    }

    updateSafetyViolations(violations) {
        this.safetyViolations = violations || [];
        this.renderSafetyViolations();
    }

    renderEquipmentGrid() {
        const equipmentGrid = document.getElementById('equipmentGrid');
        
        if (!this.equipmentData || this.equipmentData.length === 0) {
            equipmentGrid.innerHTML = '<p>No equipment data available</p>';
            return;
        }

        equipmentGrid.innerHTML = this.equipmentData.map(equipment => `
            <div class="equipment-card ${equipment.status}">
                <div class="equipment-header">
                    <h3 class="equipment-name">${equipment.name}</h3>
                    <div class="health-score ${equipment.status}">
                        ${equipment.health_score.toFixed(1)}%
                    </div>
                </div>
                
                <div class="equipment-info">
                    <p><strong>Type:</strong> ${equipment.type}</p>
                    <p><strong>Location:</strong> ${equipment.location}</p>
                    <p><strong>Status:</strong> 
                        <span class="status-indicator ${equipment.status}"></span>
                        ${equipment.status.charAt(0).toUpperCase() + equipment.status.slice(1)}
                    </p>
                </div>
                
                ${equipment.sensor_readings ? `
                    <div class="sensor-readings">
                        <div class="sensor-reading">
                            <span>Temperature:</span>
                            <span>${equipment.sensor_readings.temperature}°C</span>
                        </div>
                        <div class="sensor-reading">
                            <span>Vibration:</span>
                            <span>${equipment.sensor_readings.vibration}</span>
                        </div>
                        <div class="sensor-reading">
                            <span>Pressure:</span>
                            <span>${equipment.sensor_readings.pressure}</span>
                        </div>
                        <div class="sensor-reading">
                            <span>Efficiency:</span>
                            <span>${equipment.sensor_readings.efficiency}%</span>
                        </div>
                    </div>
                ` : '<p class="text-muted">No sensor data available</p>'}
                
                ${equipment.alerts && equipment.alerts.length > 0 ? `
                    <div class="equipment-alerts">
                        <h4>Alerts:</h4>
                        ${equipment.alerts.map(alert => `
                            <div class="alert-item ${alert.severity}">
                                <strong>${alert.type}:</strong> ${alert.message}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${equipment.safety_violations && equipment.safety_violations.length > 0 ? `
                    <div class="equipment-safety">
                        <h4>Safety Issues:</h4>
                        ${equipment.safety_violations.map(violation => `
                            <div class="safety-violation">
                                <strong>${violation.type}:</strong> ${violation.message}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    renderCriticalAlerts() {
        const criticalAlerts = this.alerts.filter(alert => alert.alert.severity === 'critical');
        const criticalAlertsSection = document.getElementById('criticalAlertsSection');
        const criticalAlertsList = document.getElementById('criticalAlertsList');
        
        if (criticalAlerts.length > 0) {
            criticalAlertsSection.style.display = 'block';
            criticalAlertsList.innerHTML = criticalAlerts.map(alert => `
                <div class="alert-item critical">
                    <h4>${alert.equipment_name} (${alert.equipment_location})</h4>
                    <p><strong>${alert.alert.type}:</strong> ${alert.alert.message}</p>
                    <small>Equipment ID: ${alert.equipment_id} | ${this.formatTimestamp(alert.timestamp)}</small>
                </div>
            `).join('');
        } else {
            criticalAlertsSection.style.display = 'none';
        }
    }

    renderSafetyViolations() {
        const safetyViolationsSection = document.getElementById('safetyViolationsSection');
        const safetyViolationsList = document.getElementById('safetyViolationsList');
        
        if (this.safetyViolations.length > 0) {
            safetyViolationsSection.style.display = 'block';
            safetyViolationsList.innerHTML = this.safetyViolations.map(violation => `
                <div class="safety-violation">
                    <h4>${violation.equipment_name} (${violation.equipment_location})</h4>
                    <p><strong>${violation.violation.type}:</strong> ${violation.violation.message}</p>
                    <small>Equipment ID: ${violation.equipment_id} | ${this.formatTimestamp(violation.timestamp)}</small>
                </div>
            `).join('');
        } else {
            safetyViolationsSection.style.display = 'none';
        }
    }

    updateConnectionStatus(status) {
        const connectionStatus = document.getElementById('connectionStatus');
        const statusIndicator = connectionStatus.querySelector('.status-indicator');
        
        connectionStatus.className = `connection-status ${status}`;
        
        switch (status) {
            case 'connected':
                connectionStatus.innerHTML = '<span class="status-indicator"></span>Connected';
                break;
            case 'disconnected':
                connectionStatus.innerHTML = '<span class="status-indicator"></span>Disconnected';
                break;
            case 'connecting':
                connectionStatus.innerHTML = '<span class="status-indicator pulse"></span>Connecting...';
                break;
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            this.updateConnectionStatus('connecting');
            
            setTimeout(() => {
                console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                this.connectWebSocket();
            }, this.reconnectDelay);
        } else {
            this.showNotification('Failed to reconnect to monitoring service', 'error');
            this.updateConnectionStatus('disconnected');
        }
    }

    updateLastUpdated(timestamp) {
        const lastUpdated = document.getElementById('lastUpdated');
        const date = new Date(timestamp);
        lastUpdated.textContent = `Last updated: ${date.toLocaleString()}`;
    }

    formatTimestamp(timestamp) {
        if (!timestamp) return 'Unknown time';
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    setupEventListeners() {
        // Add any additional event listeners here
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('Page hidden, maintaining connection');
            } else {
                console.log('Page visible, checking connection');
                if (!this.isConnected) {
                    this.connectWebSocket();
                }
            }
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1001;
            max-width: 300px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#28a745';
                break;
            case 'error':
                notification.style.backgroundColor = '#dc3545';
                break;
            case 'warning':
                notification.style.backgroundColor = '#ffc107';
                notification.style.color = '#000';
                break;
            default:
                notification.style.backgroundColor = '#17a2b8';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Initialize equipment monitoring when page loads
document.addEventListener('DOMContentLoaded', () => {
    new EquipmentMonitoring();
});
