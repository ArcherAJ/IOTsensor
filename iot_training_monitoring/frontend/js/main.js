// Optimized IoT Lab Monitor - Main JavaScript with Performance Enhancements
class IoTLabMonitor {
    constructor() {
        this.currentSection = 'home';
        this.wsConnection = null;
        this.charts = {};
        this.animations = {};
        this.currentUser = { id: 1, name: 'John Doe', role: 'trainer' };
        this.equipmentData = [];
        this.insightsData = [];
        this.gamificationData = {};
        this.performanceMetrics = {
            loadTime: performance.now(),
            renderTime: 0,
            updateCount: 0
        };
        this.isTransitioning = false; // Prevent rapid section switching
        this.init();
    }

    init() {
        // Use requestIdleCallback for non-critical initialization
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => this.initializeNonCritical());
        } else {
            setTimeout(() => this.initializeNonCritical(), 0);
        }
        
        this.setupEventListeners();
        this.initializeCriticalFeatures();
    }

    initializeCriticalFeatures() {
        // Only initialize critical features immediately
        this.connectWebSocket();
        this.loadInitialData();
        this.initializeAnimations();
    }

    initializeNonCritical() {
        // Initialize non-critical features when browser is idle
        this.initializeCharts();
        this.startRealTimeUpdates();
        this.preloadResources();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
            });
        });

        // Notification button
        document.getElementById('notificationBtn')?.addEventListener('click', () => {
            this.toggleNotifications();
        });

        // Chatbot toggle
        document.getElementById('chatbotToggleBtn')?.addEventListener('click', () => {
            this.toggleChatbot();
        });

        document.getElementById('chatbotToggle')?.addEventListener('click', () => {
            this.closeChatbot();
        });

        // Chart period buttons
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const period = e.target.getAttribute('data-period');
                this.updateChartPeriod(period);
            });
        });

        // Equipment action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleEquipmentAction(e.target);
            });
        });

        // Environment selector
        document.querySelectorAll('.env-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const env = e.currentTarget.getAttribute('data-env');
                this.selectEnvironment(env);
            });
        });

        // Scenario selector
        document.querySelectorAll('.scenario-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const scenario = e.target.getAttribute('data-scenario');
                this.selectScenario(scenario);
            });
        });

        // Insight action buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('insight-action-btn')) {
                this.handleInsightAction(e.target);
            }
        });

        // Close notifications
        document.getElementById('closeNotifications')?.addEventListener('click', () => {
            this.closeNotifications();
        });
    }

    showSection(sectionName) {
        console.log('Switching to section:', sectionName);
        
        // Prevent multiple rapid clicks
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        // Use requestAnimationFrame for smoother transitions
        requestAnimationFrame(() => {
            // Hide all sections with optimized performance
            const sections = document.querySelectorAll('section');
            const navLinks = document.querySelectorAll('.nav-link');
            
            // Batch DOM updates
            sections.forEach(section => {
                if (section.classList.contains('active')) {
                    section.classList.remove('active');
                }
            });
            
            navLinks.forEach(link => {
                if (link.classList.contains('active')) {
                    link.classList.remove('active');
                }
            });

            // Show selected section
            const targetSection = document.getElementById(sectionName);
            if (targetSection) {
                // Add active class immediately for instant visual feedback
                targetSection.classList.add('active');
                this.currentSection = sectionName;
                
                // Update navigation
                const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }

                // Show loading indicator for sections that might take time
                if (['dashboard', 'virtual-lab', 'ai-insights'].includes(sectionName)) {
                    this.showLoadingIndicator();
                }

                // Initialize section-specific features asynchronously
                requestAnimationFrame(() => {
                    this.initializeSection(sectionName);
                    this.hideLoadingIndicator();
                });
                
                // Smooth scroll to top
                window.scrollTo({ 
                    top: 0, 
                    behavior: 'smooth' 
                });
                
                // Reset transition flag after animation completes
                setTimeout(() => {
                    this.isTransitioning = false;
                }, 400);
            } else {
                console.error('Section not found:', sectionName);
                this.isTransitioning = false;
            }
        });
    }

    showLoadingIndicator() {
        const loadingIndicator = document.getElementById('sectionLoading');
        if (loadingIndicator) {
            loadingIndicator.classList.add('active');
        }
    }

    hideLoadingIndicator() {
        const loadingIndicator = document.getElementById('sectionLoading');
        if (loadingIndicator) {
            setTimeout(() => {
                loadingIndicator.classList.remove('active');
            }, 300); // Small delay to ensure smooth transition
        }
    }

    initializeSection(sectionName) {
        switch (sectionName) {
            case 'dashboard':
                this.initializeDashboard();
                break;
            case 'virtual-lab':
                this.initializeVirtualLab();
                break;
            case 'ai-insights':
                this.initializeAIInsights();
                break;
            case 'gamification':
                this.initializeGamification();
                break;
            case 'technology':
                this.initializeTechnology();
                break;
        }
    }

    async initializeDashboard() {
        // Load Chart.js if not already loaded
        if (typeof Chart === 'undefined') {
            window.loadChartJS();
            await this.waitForChartJS();
        }
        
        await this.updateDashboardMetrics();
        this.createPerformanceChart();
        this.createEnergyChart();
        await this.loadEquipmentData();
    }

    async waitForChartJS() {
        return new Promise((resolve) => {
            const checkChart = () => {
                if (typeof Chart !== 'undefined') {
                    resolve();
                } else {
                    setTimeout(checkChart, 100);
                }
            };
            checkChart();
        });
    }

    async initializeVirtualLab() {
        // Load Three.js and virtual lab if not already loaded
        if (typeof THREE === 'undefined') {
            window.loadThreeJS();
            // Wait for Three.js to load
            await this.waitForThreeJS();
        }
        
        if (typeof VirtualLab3D !== 'undefined') {
            this.virtualLab = new VirtualLab3D();
            await this.virtualLab.initialize();
        }
        await this.loadVirtualEnvironments();
    }

    async waitForThreeJS() {
        return new Promise((resolve) => {
            const checkThree = () => {
                if (typeof THREE !== 'undefined') {
                    resolve();
                } else {
                    setTimeout(checkThree, 100);
                }
            };
            checkThree();
        });
    }

    async initializeAIInsights() {
        await this.loadAIInsights();
        this.createPredictiveChart();
    }

    async initializeGamification() {
        await this.loadLeaderboard();
        await this.loadUserStats();
        await this.loadChallenges();
    }

    async initializeTechnology() {
        await this.loadTechnologyStack();
        this.createArchitectureDiagram();
    }

    async loadInitialData() {
        try {
            // Use AbortController for request timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch('/api/overview', {
                signal: controller.signal,
                headers: {
                    'Cache-Control': 'max-age=30'
                }
            });
            clearTimeout(timeoutId);
            
            const data = await response.json();
            this.updateOverviewStats(data);
        } catch (error) {
            console.error('Error loading initial data:', error);
            // Use demo data if API fails
            this.updateOverviewStats({
                total_equipment: 25,
                active_equipment: 18,
                maintenance_alerts: 3,
                uptime_percentage: 94.5
            });
        }
    }

    preloadResources() {
        // Preload critical resources
        const criticalImages = [
            '/static/images/equipment-icons.png',
            '/static/images/background-pattern.svg'
        ];
        
        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
        
        // Preload next section data
        this.preloadSectionData('dashboard');
    }

    async preloadSectionData(sectionName) {
        try {
            const endpoints = {
                'dashboard': '/api/overview',
                'ai-insights': '/api/ai-insights',
                'gamification': '/api/gamification/leaderboard',
                'virtual-lab': '/api/virtual-lab/environments'
            };
            
            const endpoint = endpoints[sectionName];
            if (endpoint) {
                const response = await fetch(endpoint);
                const data = await response.json();
                this.cacheSectionData(sectionName, data);
            }
        } catch (error) {
            console.warn(`Failed to preload ${sectionName} data:`, error);
        }
    }

    cacheSectionData(sectionName, data) {
        // Cache data for faster section switching
        if (!this.sectionCache) this.sectionCache = {};
        this.sectionCache[sectionName] = {
            data: data,
            timestamp: Date.now()
        };
    }

    getCachedSectionData(sectionName) {
        if (!this.sectionCache || !this.sectionCache[sectionName]) return null;
        
        const cached = this.sectionCache[sectionName];
        const age = Date.now() - cached.timestamp;
        
        // Use cached data if less than 5 minutes old
        if (age < 300000) {
            return cached.data;
        }
        
        return null;
    }

    updateOverviewStats(data) {
        // Update metric cards with animation
        this.animateCounter('total-equipment', data.total_equipment);
        this.animateCounter('active-equipment', data.active_equipment);
        this.animateCounter('maintenance-alerts', data.maintenance_alerts);
        this.animateCounter('uptime-percentage', data.uptime_percentage, '%');
    }

    animateCounter(elementId, targetValue, suffix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = 0;
        const duration = 2000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
            element.textContent = currentValue + suffix;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    initializeCharts() {
        // Initialize Chart.js defaults
        Chart.defaults.font.family = 'Inter, sans-serif';
        Chart.defaults.color = '#374151';
        Chart.defaults.plugins.legend.display = false;
    }

    createPerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;

        const data = {
            labels: this.generateTimeLabels(24),
            datasets: [{
                label: 'Efficiency',
                data: this.generateRandomData(24, 80, 95),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }, {
                label: 'Temperature',
                data: this.generateRandomData(24, 20, 60),
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                yAxisID: 'y1'
            }]
        };

        this.charts.performance = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    createEnergyChart() {
        const ctx = document.getElementById('energyChart');
        if (!ctx) return;

        const data = {
            labels: this.generateTimeLabels(24),
            datasets: [{
                label: 'Power Consumption',
                data: this.generateRandomData(24, 1000, 5000),
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: '#10b981',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }]
        };

        this.charts.energy = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Power: ' + context.parsed.y + 'W';
                            }
                        }
                    }
                }
            }
        });
    }

    createPredictiveChart() {
        const ctx = document.getElementById('predictiveChart');
        if (!ctx) return;

        const data = {
            labels: ['Current', '1 Day', '3 Days', '7 Days', '14 Days', '30 Days'],
            datasets: [{
                label: 'Predicted Efficiency',
                data: [92, 90, 87, 82, 75, 65],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }, {
                label: 'Failure Threshold',
                data: [70, 70, 70, 70, 70, 70],
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false
            }]
        };

        this.charts.predictive = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                }
            }
        });
    }

    generateTimeLabels(hours) {
        const labels = [];
        const now = new Date();
        for (let i = hours - 1; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60 * 60 * 1000);
            labels.push(time.getHours() + ':00');
        }
        return labels;
    }

    generateRandomData(count, min, max) {
        return Array.from({ length: count }, () => 
            Math.floor(Math.random() * (max - min + 1)) + min
        );
    }

    connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        this.wsConnection = new WebSocket(wsUrl);
        
        this.wsConnection.onopen = () => {
            console.log('WebSocket connected');
        };
        
        this.wsConnection.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleRealTimeUpdate(data);
        };
        
        this.wsConnection.onclose = () => {
            console.log('WebSocket disconnected');
            // Reconnect after 5 seconds
            setTimeout(() => this.connectWebSocket(), 5000);
        };
    }

    handleRealTimeUpdate(data) {
        if (data.type === 'real_time_update') {
            this.updateRealTimeData(data);
        }
    }

    updateRealTimeData(data) {
        // Update dashboard with real-time data
        if (this.currentSection === 'dashboard') {
            this.updateDashboardMetrics(data);
        }
    }

    startRealTimeUpdates() {
        setInterval(() => {
            this.updateChartsWithNewData();
        }, 5000);
    }

    updateChartsWithNewData() {
        // Add new data points to charts
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.data.datasets[0]) {
                const newValue = Math.floor(Math.random() * 20) + 80;
                chart.data.labels.push(new Date().toLocaleTimeString());
                chart.data.datasets[0].data.push(newValue);
                
                // Keep only last 24 data points
                if (chart.data.labels.length > 24) {
                    chart.data.labels.shift();
                    chart.data.datasets[0].data.shift();
                }
                
                chart.update('none');
            }
        });
    }

    initializeAnimations() {
        // Initialize anime.js animations
        if (typeof anime !== 'undefined') {
            this.animations.heroTitle = anime({
                targets: '.hero-title',
                translateY: [50, 0],
                opacity: [0, 1],
                duration: 1000,
                easing: 'easeOutExpo',
                delay: 300
            });

            this.animations.heroDescription = anime({
                targets: '.hero-description',
                translateY: [30, 0],
                opacity: [0, 1],
                duration: 800,
                easing: 'easeOutExpo',
                delay: 600
            });

            this.animations.heroButtons = anime({
                targets: '.hero-actions .cta-button',
                translateY: [30, 0],
                opacity: [0, 1],
                duration: 600,
                easing: 'easeOutExpo',
                delay: anime.stagger(200, {start: 900})
            });
        }
    }

    toggleNotifications() {
        const panel = document.getElementById('notificationPanel');
        panel.classList.toggle('active');
    }

    closeNotifications() {
        const panel = document.getElementById('notificationPanel');
        panel.classList.remove('active');
    }

    toggleChatbot() {
        const container = document.getElementById('chatbotContainer');
        container.classList.toggle('active');
    }

    closeChatbot() {
        const container = document.getElementById('chatbotContainer');
        container.classList.remove('active');
    }

    updateChartPeriod(period) {
        // Update chart buttons
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-period="${period}"]`)?.classList.add('active');

        // Update chart data based on period
        this.loadChartData(period);
    }

    async loadChartData(period) {
        try {
            const response = await fetch(`/api/charts/${period}`);
            const data = await response.json();
            
            // Update charts with new data
            if (this.charts.performance) {
                this.charts.performance.data = data.performance;
                this.charts.performance.update();
            }
            
            if (this.charts.energy) {
                this.charts.energy.data = data.energy;
                this.charts.energy.update();
            }
        } catch (error) {
            console.error('Error loading chart data:', error);
        }
    }

    handleEquipmentAction(button) {
        const action = button.querySelector('i').className;
        const equipmentCard = button.closest('.equipment-card');
        const equipmentName = equipmentCard.querySelector('h4').textContent;
        
        // Show action feedback
        this.showActionFeedback(equipmentName, action);
    }

    showActionFeedback(equipmentName, action) {
        const feedback = document.createElement('div');
        feedback.className = 'action-feedback';
        feedback.innerHTML = `
            <i class="fas fa-check-circle"></i>
            Action performed on ${equipmentName}
        `;
        
        document.body.appendChild(feedback);
        
        // Animate feedback
        if (typeof anime !== 'undefined') {
            anime({
                targets: feedback,
                translateY: [-50, 0],
                opacity: [0, 1],
                duration: 300,
                easing: 'easeOutExpo',
                complete: () => {
                    setTimeout(() => {
                        anime({
                            targets: feedback,
                            translateY: [0, -50],
                            opacity: [1, 0],
                            duration: 300,
                            easing: 'easeInExpo',
                            complete: () => feedback.remove()
                        });
                    }, 2000);
                }
            });
        }
    }

    selectEnvironment(env) {
        // Update environment cards
        document.querySelectorAll('.env-card').forEach(card => {
            card.classList.remove('active');
        });
        document.querySelector(`[data-env="${env}"]`)?.classList.add('active');

        // Load environment data
        this.loadEnvironmentData(env);
    }

    selectScenario(scenario) {
        // Update scenario buttons
        document.querySelectorAll('.scenario-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-scenario="${scenario}"]`)?.classList.add('active');

        // Load scenario data
        this.loadScenarioData(scenario);
    }

    async loadEnvironmentData(env) {
        try {
            const response = await fetch(`/api/virtual-lab/environment/${env}`);
            const data = await response.json();
            this.updateVirtualLabEnvironment(data);
        } catch (error) {
            console.error('Error loading environment data:', error);
        }
    }

    async loadScenarioData(scenario) {
        try {
            const response = await fetch(`/api/virtual-lab/scenario/${scenario}`);
            const data = await response.json();
            this.updateVirtualLabScenario(data);
        } catch (error) {
            console.error('Error loading scenario data:', error);
        }
    }

    updateVirtualLabEnvironment(data) {
        // Update 3D environment
        console.log('Updating virtual lab environment:', data);
    }

    updateVirtualLabScenario(data) {
        // Update scenario
        console.log('Updating virtual lab scenario:', data);
    }

    async loadAIInsights() {
        try {
            const response = await fetch('/api/ai-insights');
            const insights = await response.json();
            this.displayAIInsights(insights);
        } catch (error) {
            console.error('Error loading AI insights:', error);
            // Use demo data
            this.displayAIInsights([
                {
                    id: 1,
                    type: 'anomaly',
                    title: 'Anomaly Detection',
                    description: 'Unusual temperature patterns detected in CNC Machine #2. Recommend immediate inspection.',
                    confidence: 0.85,
                    impact: 'high',
                    category: 'safety'
                },
                {
                    id: 2,
                    type: 'trend',
                    title: 'Efficiency Trend',
                    description: 'Equipment efficiency showing declining trend over past 7 days. Consider preventive maintenance.',
                    confidence: 0.75,
                    impact: 'medium',
                    category: 'efficiency'
                },
                {
                    id: 3,
                    type: 'recommendation',
                    title: 'Optimization Opportunity',
                    description: 'Power consumption 20% above average. Potential energy savings: 150 kWh/month with optimization.',
                    confidence: 0.70,
                    impact: 'medium',
                    category: 'efficiency'
                }
            ]);
        }
    }

    displayAIInsights(insights) {
        const container = document.querySelector('.insights-grid');
        if (!container) return;

        container.innerHTML = insights.map(insight => `
            <div class="insight-card">
                <div class="insight-header">
                    <div class="insight-icon">
                        <i class="fas fa-${this.getInsightIcon(insight.type)}"></i>
                    </div>
                    <div class="insight-meta">
                        <h4>${insight.title}</h4>
                        <span class="confidence">Confidence: ${Math.round(insight.confidence * 100)}%</span>
                    </div>
                </div>
                <div class="insight-content">
                    <p>${insight.description}</p>
                    <div class="insight-actions">
                        <button class="action-btn primary insight-action-btn" data-insight-id="${insight.id}">View Details</button>
                        <button class="action-btn secondary insight-action-btn" data-insight-id="${insight.id}">Take Action</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getInsightIcon(type) {
        const icons = {
            'anomaly': 'exclamation-triangle',
            'trend': 'chart-line',
            'prediction': 'crystal-ball',
            'recommendation': 'lightbulb'
        };
        return icons[type] || 'info-circle';
    }

    handleInsightAction(button) {
        const insightId = button.getAttribute('data-insight-id');
        const action = button.textContent.trim();
        
        this.showActionFeedback(`Insight ${insightId}`, action);
    }

    async loadLeaderboard() {
        try {
            const response = await fetch('/api/gamification/leaderboard');
            const leaderboard = await response.json();
            this.displayLeaderboard(leaderboard);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            // Use demo data
            this.displayLeaderboard([
                { rank: 1, first_name: 'Jane', last_name: 'Smith', role: 'Lab Manager', total_points: 2100 },
                { rank: 2, first_name: 'John', last_name: 'Doe', role: 'Trainer', total_points: 1250 },
                { rank: 3, first_name: 'Bob', last_name: 'Wilson', role: 'Student', total_points: 850 }
            ]);
        }
    }

    displayLeaderboard(leaderboard) {
        const container = document.querySelector('.leaderboard-list');
        if (!container) return;

        container.innerHTML = leaderboard.map((user, index) => `
            <div class="leaderboard-item rank-${index + 1}">
                <div class="rank">${index + 1}</div>
                <div class="user-info">
                    <div class="avatar">
                        <i class="fas fa-${this.getRankIcon(index + 1)}"></i>
                    </div>
                    <div class="user-details">
                        <h4>${user.first_name} ${user.last_name}</h4>
                        <p>${user.role}</p>
                    </div>
                </div>
                <div class="score">${user.total_points.toLocaleString()} pts</div>
            </div>
        `).join('');
    }

    getRankIcon(rank) {
        const icons = {
            1: 'crown',
            2: 'medal',
            3: 'award'
        };
        return icons[rank] || 'user';
    }

    async loadUserStats() {
        try {
            const response = await fetch(`/api/gamification/user/${this.currentUser.id}/stats`);
            const stats = await response.json();
            this.displayUserStats(stats);
        } catch (error) {
            console.error('Error loading user stats:', error);
        }
    }

    displayUserStats(stats) {
        // Update user stats in gamification section
        console.log('User stats:', stats);
    }

    async loadChallenges() {
        try {
            const response = await fetch(`/api/gamification/challenges/${this.currentUser.role}`);
            const challenges = await response.json();
            this.displayChallenges(challenges);
        } catch (error) {
            console.error('Error loading challenges:', error);
        }
    }

    displayChallenges(challenges) {
        const container = document.querySelector('.challenges-list');
        if (!container) return;

        container.innerHTML = challenges.map(challenge => `
            <div class="challenge-item">
                <div class="challenge-icon">
                    <i class="fas fa-target"></i>
                </div>
                <div class="challenge-content">
                    <h4>${challenge.title}</h4>
                    <p>${challenge.description}</p>
                    <div class="challenge-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${challenge.progress || 0}%"></div>
                        </div>
                        <span>${challenge.progress || 0}%</span>
                    </div>
                </div>
                <div class="challenge-reward">${challenge.points_reward} pts</div>
            </div>
        `).join('');
    }

    async loadTechnologyStack() {
        try {
            const response = await fetch('/api/technology/stack');
            const techStack = await response.json();
            this.displayTechnologyStack(techStack);
        } catch (error) {
            console.error('Error loading technology stack:', error);
            // Use demo data
            this.displayTechnologyStack([
                { category: 'Backend', name: 'FastAPI', description: 'Modern, fast web framework for building APIs', integration_status: 'active' },
                { category: 'Backend', name: 'PostgreSQL', description: 'Advanced open source relational database', integration_status: 'active' },
                { category: 'AI & Machine Learning', name: 'scikit-learn', description: 'Machine learning library for predictive analytics', integration_status: 'active' },
                { category: 'AI & Machine Learning', name: 'TensorFlow', description: 'Deep learning framework for advanced AI models', integration_status: 'active' },
                { category: 'Frontend & 3D', name: 'Three.js', description: '3D graphics library for virtual lab environments', integration_status: 'active' },
                { category: 'Frontend & 3D', name: 'Responsive Design', description: 'Mobile-first design for all devices', integration_status: 'active' }
            ]);
        }
    }

    displayTechnologyStack(techStack) {
        const container = document.querySelector('.tech-grid');
        if (!container) return;

        const grouped = techStack.reduce((acc, tech) => {
            if (!acc[tech.category]) acc[tech.category] = [];
            acc[tech.category].push(tech);
            return acc;
        }, {});

        container.innerHTML = Object.entries(grouped).map(([category, items]) => `
            <div class="tech-category">
                <h3>${category}</h3>
                <div class="tech-items">
                    ${items.map(item => `
                        <div class="tech-item">
                            <div class="tech-icon">
                                <i class="fas fa-${this.getTechIcon(item.name)}"></i>
                            </div>
                            <div class="tech-info">
                                <h4>${item.name}</h4>
                                <p>${item.description}</p>
                                <span class="tech-status ${item.integration_status}">${item.integration_status}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    getTechIcon(techName) {
        const icons = {
            'FastAPI': 'server',
            'PostgreSQL': 'database',
            'scikit-learn': 'brain',
            'TensorFlow': 'chart-line',
            'Three.js': 'cube',
            'React': 'mobile-alt',
            'Responsive Design': 'mobile-alt'
        };
        return icons[techName] || 'cog';
    }

    createArchitectureDiagram() {
        // Architecture diagram is already in HTML, just ensure it's visible
        const diagram = document.querySelector('.architecture-diagram');
        if (diagram) {
            diagram.style.display = 'block';
        }
    }

    async loadEquipmentData() {
        try {
            const response = await fetch('/api/equipment');
            const equipment = await response.json();
            this.equipmentData = equipment;
            this.updateEquipmentDisplay(equipment);
        } catch (error) {
            console.error('Error loading equipment data:', error);
        }
    }

    updateEquipmentDisplay(equipment) {
        const container = document.querySelector('.equipment-grid');
        if (!container) return;

        container.innerHTML = equipment.slice(0, 6).map(eq => `
            <div class="equipment-card">
                <div class="equipment-header">
                    <h4>${eq.name}</h4>
                    <span class="status-badge ${eq.status}">${eq.status}</span>
                </div>
                <div class="equipment-metrics">
                    <div class="metric">
                        <span class="label">Type:</span>
                        <span class="value">${eq.type}</span>
                    </div>
                    <div class="metric">
                        <span class="label">Location:</span>
                        <span class="value">${eq.location}</span>
                    </div>
                    <div class="metric">
                        <span class="label">Status:</span>
                        <span class="value">${eq.status}</span>
                    </div>
                </div>
                <div class="equipment-actions">
                    <button class="action-btn"><i class="fas fa-eye"></i></button>
                    <button class="action-btn"><i class="fas fa-cog"></i></button>
                    <button class="action-btn"><i class="fas fa-chart-bar"></i></button>
                </div>
            </div>
        `).join('');
    }

    async updateDashboardMetrics(data = null) {
        if (!data) {
            // Generate demo data
            data = {
                total_equipment: 25,
                active_equipment: 18,
                maintenance_alerts: 3,
                uptime_percentage: 94.5
            };
        }

        this.updateOverviewStats(data);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.iotLabMonitor = new IoTLabMonitor();
});

// Global functions for HTML onclick handlers
function showSection(sectionName) {
    console.log('Global showSection called with:', sectionName);
    if (window.iotLabMonitor) {
        window.iotLabMonitor.showSection(sectionName);
    } else {
        console.error('iotLabMonitor not initialized yet');
        // Fallback: direct section switching
        document.querySelectorAll('section').forEach(section => {
            section.classList.remove('active');
        });
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }
}