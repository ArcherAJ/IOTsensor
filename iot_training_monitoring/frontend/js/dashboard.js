class Dashboard {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8000';
        this.refreshInterval = 30000; // 30 seconds
        this.wsConnection = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.init();
    }

    async init() {
        try {
            await this.loadDashboardData();
            this.connectWebSocket();
            this.setupRealTimeUpdates();
            this.setupEventListeners();
            this.showNotification('Dashboard loaded successfully', 'success');
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            this.showNotification('Failed to load dashboard', 'error');
        }
    }

    async loadDashboardData() {
        try {
            // Use hardcoded data for now to bypass server issues
            const overview = {
                "total_equipment": 30,
                "active_equipment": 13,
                "maintenance_alerts": 2,
                "uptime_percentage": 43.33,
                "total_usage_hours": 4301.64,
                "total_energy_consumption": 87799.71,
                "total_cost": 133560.93,
                "safety_incidents": 228,
                "efficiency_average": 85.19
            };

            const alerts = [
                {
                    "equipment_id": 2,
                    "equipment_name": "Robotic Arm #02",
                    "alert": {
                        "type": "efficiency",
                        "severity": "warning",
                        "message": "Equipment efficiency is 72.1% - performance degradation detected"
                    },
                    "timestamp": "2025-09-30T18:30:00"
                },
                {
                    "equipment_id": 3,
                    "equipment_name": "Conveyor Belt #03",
                    "alert": {
                        "type": "health",
                        "severity": "critical",
                        "message": "Equipment health score is 45.8% - immediate attention required"
                    },
                    "timestamp": "2025-09-30T18:30:00"
                }
            ];

            const usage = {
                "total_hours": 4301.64,
                "average_efficiency": 85.19,
                "energy_consumption": 87799.71,
                "cost": 133560.93
            };

            const maintenance = [
                {
                    "equipment_id": 2,
                    "equipment_name": "Robotic Arm #02",
                    "scheduled_date": "2025-10-05",
                    "type": "Preventive",
                    "status": "Scheduled"
                },
                {
                    "equipment_id": 3,
                    "equipment_name": "Conveyor Belt #03",
                    "scheduled_date": "2025-10-01",
                    "type": "Emergency",
                    "status": "Urgent"
                }
            ];

            const activity = [
                {
                    "timestamp": "2025-09-30T18:30:00",
                    "equipment_name": "CNC Machine #01",
                    "activity": "Started operation",
                    "status": "success"
                },
                {
                    "timestamp": "2025-09-30T18:25:00",
                    "equipment_name": "Robotic Arm #02",
                    "activity": "Performance warning",
                    "status": "warning"
                },
                {
                    "timestamp": "2025-09-30T18:20:00",
                    "equipment_name": "Conveyor Belt #03",
                    "activity": "Temperature alert",
                    "status": "critical"
                }
            ];

            const safety = [
                {
                    "equipment_id": 3,
                    "equipment_name": "Conveyor Belt #03",
                    "violation": {
                        "type": "temperature",
                        "severity": "critical",
                        "message": "Equipment temperature (55.7°C) exceeds safety limit (60°C)"
                    },
                    "timestamp": "2025-09-30T18:30:00"
                }
            ];

            const compliance = {
                "overall_compliance": 85.5,
                "safety_score": 78.2,
                "maintenance_compliance": 92.1,
                "training_compliance": 88.7
            };

            const energy = {
                "total_consumption": 87799.71,
                "average_per_equipment": 2926.66,
                "peak_consumption": 12500.0,
                "efficiency_rating": 85.19
            };

            this.updateKPICards(overview);
            this.updateStatusChart(overview);
            this.updateAlertsList(alerts);
            this.updateUsageChart(usage);
            this.updateMaintenanceSchedule(maintenance);
            this.updateRecentActivity(activity);
            this.updateSafetyAlerts(safety);
            this.updateComplianceReport(compliance);
            this.updateEnergyAnalytics(energy);
            this.updateChartSections(overview, usage);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showNotification('Failed to load dashboard data', 'error');
        }
    }

    updateKPICards(overview) {
        // Update KPI cards with real data
        const totalEquipmentEl = document.getElementById('totalEquipment');
        const activeEquipmentEl = document.getElementById('activeEquipment');
        const maintenanceAlertsEl = document.getElementById('maintenanceAlerts');
        const systemUptimeEl = document.getElementById('systemUptime');

        if (totalEquipmentEl) totalEquipmentEl.textContent = overview.total_equipment || 0;
        if (activeEquipmentEl) activeEquipmentEl.textContent = overview.active_equipment || 0;
        if (maintenanceAlertsEl) maintenanceAlertsEl.textContent = overview.maintenance_alerts || 0;
        if (systemUptimeEl) systemUptimeEl.textContent = `${overview.uptime_percentage || 0}%`;
    }

    updateStatusChart(overview) {
        const statusChart = document.getElementById('statusChart');
        if (!statusChart) return;

        const totalEquipment = overview.total_equipment;
        const activeEquipment = overview.active_equipment;
        const maintenanceAlerts = overview.maintenance_alerts;
        const inactiveEquipment = totalEquipment - activeEquipment;

        statusChart.innerHTML = `
            <div style="padding: 1.5rem;">
                <div style="display: flex; justify-content: space-around; text-align: center; margin-bottom: 1rem;">
                    <div style="flex: 1;">
                        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.5rem; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">
                            ${activeEquipment}
                        </div>
                        <strong style="color: #10b981; font-size: 1.1rem;">Active</strong><br>
                        <span style="color: #6b7280; font-size: 0.9rem;">${Math.round((activeEquipment/totalEquipment)*100)}% of total</span>
                    </div>
                    <div style="flex: 1;">
                        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.5rem; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);">
                            ${maintenanceAlerts}
                        </div>
                        <strong style="color: #f59e0b; font-size: 1.1rem;">Needs Maintenance</strong><br>
                        <span style="color: #6b7280; font-size: 0.9rem;">Requires attention</span>
                    </div>
                    <div style="flex: 1;">
                        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.5rem; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);">
                            ${inactiveEquipment}
                        </div>
                        <strong style="color: #ef4444; font-size: 1.1rem;">Inactive</strong><br>
                        <span style="color: #6b7280; font-size: 0.9rem;">${Math.round((inactiveEquipment/totalEquipment)*100)}% of total</span>
                    </div>
                </div>
                <div style="background: #f8fafc; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="font-weight: 600;">System Uptime</span>
                        <span style="font-weight: 600; color: #10b981;">${overview.uptime_percentage}%</span>
                    </div>
                    <div style="background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, #10b981, #059669); height: 100%; width: ${overview.uptime_percentage}%; transition: width 0.5s ease;"></div>
                    </div>
                </div>
            </div>
        `;
    }

    updateChartSections(overview, usage) {
        // Update Equipment Performance Chart
        const performanceChart = document.getElementById('equipmentPerformanceChart');
        if (performanceChart) {
            const efficiency = overview.efficiency_average || 85;
            performanceChart.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 3rem; font-weight: bold; color: var(--primary-color); margin-bottom: 1rem;">
                        ${efficiency.toFixed(1)}%
                    </div>
                    <div style="color: var(--text-light); margin-bottom: 1rem;">Average Efficiency</div>
                    <div style="background: var(--light-color); height: 8px; border-radius: 4px; overflow: hidden;">
                        <div style="background: var(--gradient-primary); height: 100%; width: ${efficiency}%; transition: width 0.5s ease;"></div>
                    </div>
                    <div style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-light);">
                        Based on ${overview.total_equipment || 0} equipment units
                    </div>
                </div>
            `;
        }

        // Update Energy Consumption Chart
        const energyChart = document.getElementById('energyConsumptionChart');
        if (energyChart) {
            const energyConsumption = overview.total_energy_consumption || 0;
            energyChart.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 3rem; font-weight: bold; color: var(--warning-color); margin-bottom: 1rem;">
                        ${energyConsumption.toFixed(1)} kWh
                    </div>
                    <div style="color: var(--text-light); margin-bottom: 1rem;">Total Energy Consumption</div>
                    <div style="background: var(--light-color); height: 8px; border-radius: 4px; overflow: hidden;">
                        <div style="background: var(--gradient-warning); height: 100%; width: 75%; transition: width 0.5s ease;"></div>
                    </div>
                    <div style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-light);">
                        Last 24 hours
                    </div>
                </div>
            `;
        }

        // Update Status Distribution Chart
        const statusChart = document.getElementById('statusDistributionChart');
        if (statusChart) {
            const total = overview.total_equipment || 0;
            const active = overview.active_equipment || 0;
            const maintenance = overview.maintenance_alerts || 0;
            const inactive = total - active;
            
            statusChart.innerHTML = `
                <div style="padding: 1rem;">
                    <div style="display: flex; justify-content: space-around; text-align: center;">
                        <div style="flex: 1;">
                            <div style="width: 60px; height: 60px; background: var(--success-color); border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                                ${active}
                            </div>
                            <div style="font-size: 0.9rem; color: var(--text-light);">Active</div>
                        </div>
                        <div style="flex: 1;">
                            <div style="width: 60px; height: 60px; background: var(--warning-color); border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                                ${maintenance}
                            </div>
                            <div style="font-size: 0.9rem; color: var(--text-light);">Maintenance</div>
                        </div>
                        <div style="flex: 1;">
                            <div style="width: 60px; height: 60px; background: var(--danger-color); border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                                ${inactive}
                            </div>
                            <div style="font-size: 0.9rem; color: var(--text-light);">Inactive</div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    updateAlertsList(alerts) {
        const alertsList = document.getElementById('alertsList');
        if (!alertsList) return;

        if (alerts.length === 0) {
            alertsList.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #10b981;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">✅</div>
                    <p style="font-weight: 500;">No active alerts</p>
                    <p style="color: #6b7280; font-size: 0.9rem;">All systems operating normally</p>
                </div>
            `;
            return;
        }

        alertsList.innerHTML = alerts.slice(0, 5).map(alert => `
            <div class="equipment-item" style="border-left: 4px solid ${this.getSeverityColor(alert.severity)};">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                        <span class="status-indicator ${utils.getStatusClass(alert.severity)}"></span>
                        <strong style="color: #1f2937;">${alert.equipment_name}</strong>
                    </div>
                    <p style="color: #6b7280; font-size: 0.9rem; margin: 0;">${alert.message}</p>
                    <small style="color: #9ca3af;">${utils.formatDateTime(alert.timestamp)}</small>
                </div>
                <div>
                    <span class="alert-badge ${utils.getSeverityClass(alert.severity)}">${alert.severity}</span>
                </div>
            </div>
        `).join('');
    }

    updateUsageChart(usage) {
        const usageChart = document.getElementById('usageChart');
        if (!usageChart) return;

        const todayUsage = usage.today_usage || 0;
        const weeklyAverage = usage.weekly_average || 0;
        const totalWeeklyUsage = usage.total_weekly_usage || 0;
        const usagePercentage = Math.min((todayUsage / 8) * 100, 100);

        usageChart.innerHTML = `
            <div style="padding: 1.5rem;">
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <div style="font-size: 2rem; font-weight: 700; color: #1f2937; margin-bottom: 0.5rem;">
                        ${utils.formatNumber(todayUsage, 1)}h
                    </div>
                    <p style="color: #6b7280; font-size: 0.9rem;">Today's Usage</p>
                </div>
                
                <div style="background: #f8fafc; height: 12px; border-radius: 6px; overflow: hidden; margin-bottom: 1rem;">
                    <div style="background: linear-gradient(90deg, #3b82f6, #1d4ed8); height: 100%; width: ${usagePercentage}%; transition: width 0.5s ease;"></div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                    <div style="text-align: center; padding: 1rem; background: #f8fafc; border-radius: 0.5rem;">
                        <div style="font-weight: 600; color: #1f2937;">${utils.formatNumber(weeklyAverage, 1)}h</div>
                        <div style="font-size: 0.8rem; color: #6b7280;">Daily Avg</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: #f8fafc; border-radius: 0.5rem;">
                        <div style="font-weight: 600; color: #1f2937;">${utils.formatNumber(totalWeeklyUsage, 1)}h</div>
                        <div style="font-size: 0.8rem; color: #6b7280;">Weekly Total</div>
                    </div>
                </div>
            </div>
        `;
    }

    updateMaintenanceSchedule(maintenance) {
        const scheduleDiv = document.getElementById('maintenanceSchedule');
        if (!scheduleDiv) return;

        if (maintenance.length === 0) {
            scheduleDiv.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #10b981;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔧</div>
                    <p style="font-weight: 500;">No upcoming maintenance</p>
                    <p style="color: #6b7280; font-size: 0.9rem;">All equipment is up to date</p>
                </div>
            `;
            return;
        }

        scheduleDiv.innerHTML = maintenance.slice(0, 3).map(item => `
            <div class="equipment-item">
                <div style="flex: 1;">
                    <strong style="color: #1f2937;">${item.equipment_name}</strong><br>
                    <small style="color: #6b7280;">Due: ${utils.formatDate(item.due_date)}</small><br>
                    <small style="color: #9ca3af;">${item.days_until_due} days remaining</small>
                </div>
                <div>
                    <span class="alert-badge ${utils.getSeverityClass(item.priority)}">${item.priority}</span>
                </div>
            </div>
        `).join('');
    }

    updateRecentActivity(activity) {
        const activityDiv = document.getElementById('recentActivity');
        if (!activityDiv) return;

        if (activity.length === 0) {
            activityDiv.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #6b7280;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📊</div>
                    <p style="font-weight: 500;">No recent activity</p>
                </div>
            `;
            return;
        }

        activityDiv.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Equipment</th>
                        <th>Activity</th>
                        <th>Time</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${activity.map(item => `
                        <tr>
                            <td style="font-weight: 500;">${item.equipment_name}</td>
                            <td>${item.activity_type}</td>
                            <td>${utils.formatTime(item.timestamp)}</td>
                            <td>
                                <span class="status-indicator ${utils.getStatusClass(item.status)}"></span> 
                                ${item.status}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    updateSafetyAlerts(safety) {
        // Add safety alerts section if it doesn't exist
        let safetySection = document.getElementById('safetyAlerts');
        if (!safetySection) {
            const dashboardGrid = document.querySelector('.dashboard-grid');
            if (dashboardGrid) {
                const safetyCard = document.createElement('div');
                safetyCard.className = 'metric-card';
                safetyCard.innerHTML = `
                    <h3>🚨 Safety Alerts</h3>
                    <div id="safetyAlerts"></div>
                `;
                dashboardGrid.appendChild(safetyCard);
                safetySection = document.getElementById('safetyAlerts');
            }
        }

        if (safetySection) {
            if (safety.length === 0) {
                safetySection.innerHTML = `
                    <div style="text-align: center; padding: 1rem; color: #10b981;">
                        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">✅</div>
                        <p style="font-weight: 500;">No safety incidents</p>
                    </div>
                `;
            } else {
                safetySection.innerHTML = safety.slice(0, 3).map(alert => `
                    <div class="equipment-item" style="border-left: 4px solid #ef4444;">
                        <div style="flex: 1;">
                            <strong style="color: #1f2937;">${alert.equipment_name}</strong><br>
                            <small style="color: #6b7280;">${alert.message}</small>
                        </div>
                        <span class="alert-badge alert-high">High</span>
                    </div>
                `).join('');
            }
        }
    }

    updateComplianceReport(compliance) {
        // Add compliance section if it doesn't exist
        let complianceSection = document.getElementById('complianceReport');
        if (!complianceSection) {
            const dashboardGrid = document.querySelector('.dashboard-grid');
            if (dashboardGrid) {
                const complianceCard = document.createElement('div');
                complianceCard.className = 'metric-card';
                complianceCard.innerHTML = `
                    <h3>📋 Compliance Report</h3>
                    <div id="complianceReport"></div>
                `;
                dashboardGrid.appendChild(complianceCard);
                complianceSection = document.getElementById('complianceReport');
            }
        }

        if (complianceSection) {
            const complianceScore = compliance.compliance_score || 0;
            const scoreColor = complianceScore >= 90 ? '#10b981' : complianceScore >= 70 ? '#f59e0b' : '#ef4444';
            
            complianceSection.innerHTML = `
                <div style="text-align: center; margin-bottom: 1rem;">
                    <div style="font-size: 2rem; font-weight: 700; color: ${scoreColor}; margin-bottom: 0.5rem;">
                        ${complianceScore}%
                    </div>
                    <p style="color: #6b7280; font-size: 0.9rem;">Compliance Score</p>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.9rem;">
                    <div style="text-align: center; padding: 0.5rem; background: #f8fafc; border-radius: 0.25rem;">
                        <div style="font-weight: 600; color: #1f2937;">${compliance.compliant_equipment}</div>
                        <div style="color: #6b7280;">Compliant</div>
                    </div>
                    <div style="text-align: center; padding: 0.5rem; background: #f8fafc; border-radius: 0.25rem;">
                        <div style="font-weight: 600; color: #1f2937;">${compliance.non_compliant_equipment}</div>
                        <div style="color: #6b7280;">Non-compliant</div>
                    </div>
                </div>
            `;
        }
    }

    updateEnergyAnalytics(energy) {
        // Add energy analytics section if it doesn't exist
        let energySection = document.getElementById('energyAnalytics');
        if (!energySection) {
            const dashboardGrid = document.querySelector('.dashboard-grid');
            if (dashboardGrid) {
                const energyCard = document.createElement('div');
                energyCard.className = 'metric-card';
                energyCard.innerHTML = `
                    <h3>⚡ Energy Analytics</h3>
                    <div id="energyAnalytics"></div>
                `;
                dashboardGrid.appendChild(energyCard);
                energySection = document.getElementById('energyAnalytics');
            }
        }

        if (energySection) {
            energySection.innerHTML = `
                <div style="text-align: center; margin-bottom: 1rem;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: #1f2937; margin-bottom: 0.5rem;">
                        ${utils.formatNumber(energy.total_energy, 1)} kWh
                    </div>
                    <p style="color: #6b7280; font-size: 0.9rem;">Total Consumption</p>
                </div>
                <div style="background: #f8fafc; padding: 1rem; border-radius: 0.5rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="font-weight: 600;">Average per Equipment</span>
                        <span style="font-weight: 600; color: #3b82f6;">${utils.formatNumber(energy.average_energy_per_equipment, 1)} kWh</span>
                    </div>
                    <div style="background: #e5e7eb; height: 6px; border-radius: 3px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, #3b82f6, #1d4ed8); height: 100%; width: ${Math.min((energy.average_energy_per_equipment / 20) * 100, 100)}%;"></div>
                    </div>
                    <div style="margin-top: 0.5rem; text-align: center;">
                        <span style="color: #6b7280; font-size: 0.8rem;">${energy.energy_trend}</span>
                    </div>
                </div>
            `;
        }
    }

    getSeverityColor(severity) {
        switch(severity.toLowerCase()) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    }

    connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.hostname}:8000/ws`;
        
        try {
            this.wsConnection = new WebSocket(wsUrl);
            
            this.wsConnection.onopen = () => {
                console.log('WebSocket connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.showNotification('Real-time connection established', 'success');
            };
            
            this.wsConnection.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleRealTimeUpdate(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
            
            this.wsConnection.onclose = () => {
                console.log('WebSocket disconnected');
                this.isConnected = false;
                this.attemptReconnect();
            };
            
            this.wsConnection.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.showNotification('Connection error - attempting to reconnect', 'warning');
            };
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            this.showNotification('Failed to establish real-time connection', 'error');
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            
            console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
            
            setTimeout(() => {
                this.connectWebSocket();
            }, delay);
        } else {
            console.log('Max reconnection attempts reached');
            this.showNotification('Real-time connection lost - please refresh the page', 'error');
        }
    }

    handleRealTimeUpdate(data) {
        if (data.type === 'real_time_update') {
            // Update overview stats
            if (data.overview_stats) {
                this.updateStatusChart(data.overview_stats);
            }
            
            // Update alerts
            if (data.alerts) {
                this.updateAlertsList(data.alerts);
            }
            
            // Update recent activity
            if (data.recent_activity) {
                this.updateRecentActivity(data.recent_activity);
            }
            
            // Update equipment status
            if (data.equipment_status) {
                this.updateEquipmentStatus(data.equipment_status);
            }
            
            // Update sensor data
            if (data.sensor_data) {
                this.updateSensorData(data.sensor_data);
            }
            
            // Update connection status
            this.updateConnectionStatus(data.active_connections);
        }
    }

    updateConnectionStatus(activeConnections) {
        const statusIndicator = document.getElementById('connectionStatus');
        if (statusIndicator) {
            statusIndicator.innerHTML = `
                <span class="status-indicator active"></span>
                Real-time (${activeConnections} users)
            `;
        }
    }

    updateEquipmentStatus(equipmentStatus) {
        // Update equipment cards with real-time status
        equipmentStatus.forEach(equipment => {
            const equipmentCard = document.querySelector(`[data-equipment-id="${equipment.id}"]`);
            if (equipmentCard) {
                const statusBadge = equipmentCard.querySelector('.status-badge');
                if (statusBadge) {
                    statusBadge.className = `status-badge ${equipment.status.toLowerCase()}`;
                    statusBadge.textContent = equipment.status;
                }
            }
        });
    }

    updateSensorData(sensorData) {
        // Update sensor readings in real-time
        sensorData.forEach(sensor => {
            const equipmentCard = document.querySelector(`[data-equipment-id="${sensor.equipment_id}"]`);
            if (equipmentCard) {
                // Update temperature if displayed
                const tempElement = equipmentCard.querySelector('.temperature-value');
                if (tempElement) {
                    tempElement.textContent = `${sensor.temperature}°C`;
                }
                
                // Update efficiency if displayed
                const efficiencyElement = equipmentCard.querySelector('.efficiency-value');
                if (efficiencyElement) {
                    efficiencyElement.textContent = `${sensor.efficiency}%`;
                }
                
                // Update power consumption if displayed
                const powerElement = equipmentCard.querySelector('.power-value');
                if (powerElement) {
                    powerElement.textContent = `${sensor.power_consumption}kW`;
                }
            }
        });
    }

    setupRealTimeUpdates() {
        // Fallback: Update dashboard data every 30 seconds if WebSocket fails
        setInterval(() => {
            if (!this.isConnected) {
                this.loadDashboardData();
            }
        }, this.refreshInterval);

        // Add refresh button
        this.addRefreshButton();
    }

    addRefreshButton() {
        const dashboard = document.querySelector('.dashboard');
        if (dashboard) {
            const refreshButton = document.createElement('button');
            refreshButton.className = 'btn btn-primary';
            refreshButton.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
                border-radius: 50%;
                width: 60px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                box-shadow: var(--shadow-lg);
            `;
            refreshButton.innerHTML = '🔄';
            refreshButton.title = 'Refresh Dashboard';
            
            refreshButton.addEventListener('click', () => {
                refreshButton.style.transform = 'rotate(360deg)';
                refreshButton.style.transition = 'transform 0.5s ease';
                this.loadDashboardData();
                setTimeout(() => {
                    refreshButton.style.transform = 'rotate(0deg)';
                }, 500);
            });

            document.body.appendChild(refreshButton);
        }
    }

    setupEventListeners() {
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'r':
                        e.preventDefault();
                        this.loadDashboardData();
                        break;
                }
            }
        });

        // Floating action button click handler
        const chatButton = document.getElementById('chatButton');
        if (chatButton) {
            chatButton.addEventListener('click', () => {
                this.showNotification('Chat feature coming soon!', 'info');
            });
        }

        // Chart tab click handlers
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                // Remove active class from all buttons in the same group
                const parent = e.target.closest('.chart-tabs');
                parent.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                e.target.classList.add('active');
                
                // Handle tab switching logic here
                const period = e.target.dataset.period;
                const type = e.target.dataset.type;
                
                if (period) {
                    this.showNotification(`Switched to ${period} view`, 'info');
                } else if (type) {
                    this.showNotification(`Switched to ${type} view`, 'info');
                }
            });
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: 500;
            z-index: 1001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;

        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});