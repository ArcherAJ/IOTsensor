class Dashboard {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8000';
        this.refreshInterval = 30000; // 30 seconds
        this.init();
    }

    async init() {
        try {
            await this.loadDashboardData();
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
            const [
                overviewResponse,
                alertsResponse,
                usageResponse,
                maintenanceResponse,
                activityResponse,
                safetyResponse,
                complianceResponse,
                energyResponse
            ] = await Promise.all([
                fetch(`${this.apiBaseUrl}/api/overview`),
                fetch(`${this.apiBaseUrl}/api/alerts`),
                fetch(`${this.apiBaseUrl}/api/usage-stats`),
                fetch(`${this.apiBaseUrl}/api/maintenance-schedule`),
                fetch(`${this.apiBaseUrl}/api/recent-activity`),
                fetch(`${this.apiBaseUrl}/api/safety-alerts`),
                fetch(`${this.apiBaseUrl}/api/compliance-report`),
                fetch(`${this.apiBaseUrl}/api/energy-analytics`)
            ]);

            const overview = await overviewResponse.json();
            const alerts = await alertsResponse.json();
            const usage = await usageResponse.json();
            const maintenance = await maintenanceResponse.json();
            const activity = await activityResponse.json();
            const safety = await safetyResponse.json();
            const compliance = await complianceResponse.json();
            const energy = await energyResponse.json();

            this.updateStatusChart(overview);
            this.updateAlertsList(alerts);
            this.updateUsageChart(usage);
            this.updateMaintenanceSchedule(maintenance);
            this.updateRecentActivity(activity);
            this.updateSafetyAlerts(safety);
            this.updateComplianceReport(compliance);
            this.updateEnergyAnalytics(energy);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showNotification('Failed to load dashboard data', 'error');
        }
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

    setupRealTimeUpdates() {
        // Update dashboard data every 30 seconds
        setInterval(() => {
            this.loadDashboardData();
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