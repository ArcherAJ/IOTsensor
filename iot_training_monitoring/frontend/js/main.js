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
        
        // Initialize scroll progress and active section
        this.updateScrollProgress();
        this.updateActiveSection();
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
        // Navigation - Smooth scrolling
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
            });
        });

        // Scroll event listeners
        window.addEventListener('scroll', () => {
            this.handleScroll();
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
                e.preventDefault();
                const period = e.target.getAttribute('data-period');
                console.log('Chart period button clicked:', period);
                this.updateChartPeriod(period);
            });
        });

        // Equipment action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Equipment action button clicked:', e.target);
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

    scrollToSection(sectionId) {
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
            
            // Initialize section if needed
            this.initializeSection(sectionId);
        }
    }

    handleScroll() {
        this.updateScrollProgress();
        this.updateActiveSection();
        this.updateNavbarState();
    }

    updateScrollProgress() {
        const scrollProgressBar = document.getElementById('scrollProgressBar');
        if (!scrollProgressBar) return;

        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        scrollProgressBar.style.width = scrollPercent + '%';
    }

    updateActiveSection() {
        const sections = document.querySelectorAll('.section');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.pageYOffset >= sectionTop && 
                window.pageYOffset < sectionTop + sectionHeight) {
                currentSection = section.id;
            }
        });
        
        // Update navigation active state
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
        
        this.currentSection = currentSection;
    }

    updateNavbarState() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        if (window.pageYOffset > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
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
        console.log('Initializing dashboard...');
        
        // Load Chart.js if not already loaded
        if (typeof Chart === 'undefined') {
            window.loadChartJS();
            await this.waitForChartJS();
        }
        
        await this.updateDashboardMetrics();
        
        // Always create charts - they will use real data if available, demo data otherwise
        console.log('Creating charts...');
        this.createPerformanceChart();
        this.createEnergyChart();
        this.createStatusChart();
        this.createMaintenanceChart();
        this.createTemperatureChart();
        this.createEfficiencyChart();
        
        await this.loadEquipmentData();
        this.setupEquipmentModal();
        this.setupChartInteractions();
        
        console.log('Dashboard initialization complete');
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
        console.log('Initializing virtual lab...');
        
        // Load Three.js and virtual lab if not already loaded
        if (typeof THREE === 'undefined') {
            window.loadThreeJS();
            // Wait for Three.js to load
            await this.waitForThreeJS();
        }
        
        // Initialize virtual lab environment
        this.initializeVirtualEnvironment();
        
        await this.loadVirtualEnvironments();
        this.setupVirtualLabControls();
        this.setupTrainingSimulator();
        
        console.log('Virtual lab initialization complete');
    }

    initializeVirtualEnvironment() {
        console.log('Setting up virtual environment...');
        
        // Create a simple 3D scene placeholder
        const viewport = document.getElementById('virtualViewport');
        if (viewport) {
            viewport.innerHTML = `
                <div class="virtual-lab-placeholder">
                    <div class="lab-environment">
                        <div class="equipment-3d">
                            <div class="cnc-machine">
                                <div class="machine-base"></div>
                                <div class="machine-arm"></div>
                                <div class="status-indicator active"></div>
                            </div>
                            <div class="robotic-arm">
                                <div class="arm-base"></div>
                                <div class="arm-segment"></div>
                                <div class="arm-gripper"></div>
                                <div class="status-indicator active"></div>
                            </div>
                            <div class="conveyor-belt">
                                <div class="belt"></div>
                                <div class="items"></div>
                                <div class="status-indicator warning"></div>
                            </div>
                        </div>
                        <div class="lab-controls">
                            <div class="control-panel">
                                <h4>Lab Controls</h4>
                                <div class="control-buttons">
                                    <button class="control-btn" data-action="start">Start Simulation</button>
                                    <button class="control-btn" data-action="pause">Pause</button>
                                    <button class="control-btn" data-action="reset">Reset</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
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
        this.createAnomalyChart();
        this.createHealthScoreChart();
        this.setupAIChat();
    }

    async initializeGamification() {
        await this.loadLeaderboard();
        await this.loadUserStats();
        await this.loadChallenges();
        this.setupGamificationInteractions();
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
            
            const response = await fetch('http://localhost:8000/api/overview', {
                signal: controller.signal,
                headers: {
                    'Cache-Control': 'max-age=30'
                }
            });
            clearTimeout(timeoutId);
            
            const data = await response.json();
            this.updateOverviewStats(data);
            
            // Load equipment data
            const equipmentResponse = await fetch('http://localhost:8000/api/equipment');
            if (equipmentResponse.ok) {
                const equipmentData = await equipmentResponse.json();
                this.updateEquipmentDisplay(equipmentData);
            }
            
            // Load chart data
            await this.loadChartData();
            
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

    async loadChartData() {
        try {
            // Load all chart data in parallel
            const chartEndpoints = [
                'http://localhost:8000/api/chart-data/performance',
                'http://localhost:8000/api/chart-data/energy',
                'http://localhost:8000/api/chart-data/status',
                'http://localhost:8000/api/chart-data/maintenance',
                'http://localhost:8000/api/chart-data/temperature',
                'http://localhost:8000/api/chart-data/efficiency'
            ];

            const responses = await Promise.all(
                chartEndpoints.map(endpoint => fetch(endpoint))
            );

            const chartData = await Promise.all(
                responses.map(response => response.json())
            );

            // Store chart data for later use
            this.chartData = {
                performance: chartData[0],
                energy: chartData[1],
                status: chartData[2],
                maintenance: chartData[3],
                temperature: chartData[4],
                efficiency: chartData[5]
            };

            console.log('Chart data loaded successfully:', this.chartData);

        } catch (error) {
            console.error('Error loading chart data:', error);
            // Use demo data as fallback
            this.chartData = null;
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
        console.log('Updating overview stats with data:', data);
        
        // Update metric cards with animation
        this.animateCounter('total-equipment', data.total_equipment || 0);
        this.animateCounter('active-equipment', data.active_equipment || 0);
        this.animateCounter('maintenance-alerts', data.maintenance_alerts || 0);
        this.animateCounter('uptime-percentage', data.uptime_percentage || 0, '%');
        
        // Update additional stats if available
        if (data.total_usage_hours) {
            this.animateCounter('total-usage', data.total_usage_hours, 'h');
        }
        if (data.total_energy_consumption) {
            this.animateCounter('total-energy', data.total_energy_consumption, 'kWh');
        }
        if (data.total_cost) {
            this.animateCounter('total-cost', data.total_cost, '$');
        }
        if (data.safety_incidents) {
            this.animateCounter('safety-incidents', data.safety_incidents);
        }
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
        if (!ctx) {
            console.log('Performance chart canvas not found');
            return;
        }

        console.log('Creating performance chart...');

        // Use real data if available, otherwise fallback to demo data
        const chartData = this.chartData?.performance || {
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
            data: chartData,
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
        if (!ctx) {
            console.log('Energy chart canvas not found');
            return;
        }

        console.log('Creating energy chart...');

        // Use real data if available, otherwise fallback to demo data
        const chartData = this.chartData?.energy || {
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
            data: chartData,
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
        const wsUrl = `${protocol}//${window.location.hostname}:8000/ws`;
        
        try {
            this.wsConnection = new WebSocket(wsUrl);
            
            this.wsConnection.onopen = () => {
                console.log('WebSocket connected');
                this.isConnected = true;
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
                // Reconnect after 5 seconds
                setTimeout(() => this.connectWebSocket(), 5000);
            };
            
            this.wsConnection.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
        }
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
        
        // Update equipment data
        if (data.equipment_status) {
            this.updateEquipmentDisplay(data.equipment_status);
        }
        
        // Update sensor data
        if (data.sensor_data) {
            this.updateSensorReadings(data.sensor_data);
        }
        
        // Update charts with new data
        this.updateChartsWithRealTimeData(data);
    }

    updateSensorReadings(sensorData) {
        // Update sensor readings in equipment cards
        sensorData.forEach(sensor => {
            const equipmentCard = document.querySelector(`[data-equipment-id="${sensor.equipment_id}"]`);
            if (equipmentCard) {
                // Update temperature
                const tempElement = equipmentCard.querySelector('.temperature-value');
                if (tempElement) {
                    tempElement.textContent = `${sensor.temperature}°C`;
                }
                
                // Update efficiency
                const efficiencyElement = equipmentCard.querySelector('.efficiency-value');
                if (efficiencyElement) {
                    efficiencyElement.textContent = `${sensor.efficiency}%`;
                }
                
                // Update power consumption
                const powerElement = equipmentCard.querySelector('.power-value');
                if (powerElement) {
                    powerElement.textContent = `${sensor.power_consumption}kW`;
                }
            }
        });
    }

    updateChartsWithRealTimeData(data) {
        // Update charts with real-time data
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.data.datasets[0]) {
                // Add new data point
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
        console.log('Updating chart period to:', period);
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
            const response = await fetch(`http://localhost:8000/api/charts/${period}`);
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
        console.log('Handling equipment action:', button);
        
        const action = button.getAttribute('data-action');
        const equipmentId = button.getAttribute('data-equipment-id');
        const equipmentCard = button.closest('.equipment-card');
        const equipmentName = equipmentCard ? equipmentCard.querySelector('h4').textContent : 'Unknown Equipment';
        
        console.log('Action:', action, 'Equipment ID:', equipmentId, 'Name:', equipmentName);
        
        // Show action feedback
        this.showActionFeedback(equipmentName, action);
        
        // Handle specific actions
        if (action === 'view') {
            this.showEquipmentModal(equipmentId);
        } else if (action === 'maintenance') {
            this.scheduleMaintenance(equipmentId);
        } else if (action === 'settings') {
            this.showEquipmentSettings(equipmentId);
        }
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
        console.log('Updating equipment display with data:', equipment);
        
        const container = document.querySelector('.equipment-grid');
        if (!container) return;

        container.innerHTML = equipment.slice(0, 12).map(eq => `
            <div class="equipment-card" data-equipment-id="${eq.id}">
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
                        <span class="label">Efficiency:</span>
                        <span class="value">${eq.efficiency || 0}%</span>
                    </div>
                </div>
                <div class="equipment-actions">
                    <button class="action-btn" data-action="view" data-equipment-id="${eq.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn" data-action="settings" data-equipment-id="${eq.id}">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button class="action-btn" data-action="analytics" data-equipment-id="${eq.id}">
                        <i class="fas fa-chart-bar"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Add click handlers for equipment cards
        container.querySelectorAll('.equipment-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.action-btn')) {
                    const equipmentId = card.getAttribute('data-equipment-id');
                    this.showEquipmentModal(equipmentId);
                }
            });
        });

        // Add action button handlers
        container.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.getAttribute('data-action');
                const equipmentId = btn.getAttribute('data-equipment-id');
                this.handleEquipmentAction(action, equipmentId);
            });
        });
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

    // New chart creation methods
    createStatusChart() {
        const ctx = document.getElementById('statusChart');
        if (!ctx) {
            console.log('Status chart canvas not found');
            return;
        }

        console.log('Creating status chart...');

        // Use real data if available, otherwise fallback to demo data
        const chartData = this.chartData?.status || {
            labels: ['Active', 'Maintenance', 'Idle', 'Offline'],
            datasets: [{
                data: [18, 3, 2, 2],
                backgroundColor: [
                    '#10b981',
                    '#f59e0b',
                    '#6b7280',
                    '#ef4444'
                ],
                borderWidth: 0
            }]
        };

        this.charts.status = new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createMaintenanceChart() {
        const ctx = document.getElementById('maintenanceChart');
        if (!ctx) {
            console.log('Maintenance chart canvas not found');
            return;
        }

        console.log('Creating maintenance chart...');

        // Use real data if available, otherwise fallback to demo data
        const chartData = this.chartData?.maintenance || {
            labels: ['This Week', 'Next Week', 'This Month', 'Next Month'],
            datasets: [{
                label: 'Maintenance Tasks',
                data: [5, 8, 15, 12],
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: '#ef4444',
                borderWidth: 2,
                borderRadius: 8
            }]
        };

        this.charts.maintenance = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    createTemperatureChart() {
        const ctx = document.getElementById('temperatureChart');
        if (!ctx) {
            console.log('Temperature chart canvas not found');
            return;
        }

        console.log('Creating temperature chart...');

        // Use real data if available, otherwise fallback to demo data
        const chartData = this.chartData?.temperature || {
            labels: this.generateTimeLabels(12),
            datasets: [{
                label: 'CNC Machines',
                data: this.generateRandomData(12, 40, 70),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            }, {
                label: 'Robots',
                data: this.generateRandomData(12, 35, 50),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4
            }]
        };

        this.charts.temperature = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Temperature (°C)'
                        }
                    }
                }
            }
        });
    }

    createEfficiencyChart() {
        const ctx = document.getElementById('efficiencyChart');
        if (!ctx) {
            console.log('Efficiency chart canvas not found');
            return;
        }

        console.log('Creating efficiency chart...');

        // Use real data if available, otherwise fallback to demo data
        const chartData = this.chartData?.efficiency || {
            labels: ['CNC #1', 'CNC #2', 'Robot #1', 'Robot #2', '3D Printer #1', 'Laser #1'],
            datasets: [{
                label: 'Efficiency (%)',
                data: [92, 89, 95, 94, 88, 91],
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: '#10b981',
                borderWidth: 2
            }, {
                label: 'Usage Hours',
                data: [6.5, 7.2, 5.8, 6.1, 4.2, 5.5],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: '#3b82f6',
                borderWidth: 2,
                yAxisID: 'y1'
            }]
        };

        this.charts.efficiency = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Efficiency (%)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Usage Hours'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    }

    createAnomalyChart() {
        const ctx = document.getElementById('anomalyChart');
        if (!ctx) return;

        const data = {
            labels: ['CNC #1', 'CNC #2', 'Robot #1', 'Robot #2', '3D Printer #1', '3D Printer #2', 'Laser #1', 'Laser #2'],
            datasets: [{
                label: 'Anomaly Score',
                data: [0.1, 0.8, 0.2, 0.3, 0.1, 0.9, 0.4, 0.2],
                backgroundColor: function(context) {
                    const value = context.parsed.y;
                    if (value > 0.7) return '#ef4444';
                    if (value > 0.4) return '#f59e0b';
                    return '#10b981';
                },
                borderWidth: 2
            }]
        };

        this.charts.anomaly = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1,
                        title: {
                            display: true,
                            text: 'Anomaly Score'
                        }
                    }
                }
            }
        });
    }

    createHealthScoreChart() {
        const ctx = document.getElementById('healthScoreChart');
        if (!ctx) return;

        const data = {
            labels: ['CNC #1', 'CNC #2', 'Robot #1', 'Robot #2', '3D Printer #1', '3D Printer #2'],
            datasets: [{
                label: 'Health Score',
                data: [85, 72, 95, 88, 78, 65],
                backgroundColor: function(context) {
                    const value = context.parsed.y;
                    if (value > 80) return '#10b981';
                    if (value > 60) return '#f59e0b';
                    return '#ef4444';
                },
                borderWidth: 2,
                borderRadius: 8
            }]
        };

        this.charts.healthScore = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Health Score (%)'
                        }
                    }
                }
            }
        });
    }

    // Equipment Modal Methods
    setupEquipmentModal() {
        const modal = document.getElementById('equipmentModal');
        const closeBtn = document.getElementById('modalClose');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    showEquipmentModal(equipmentId) {
        console.log('Showing equipment modal for ID:', equipmentId);
        
        const modal = document.getElementById('equipmentModal');
        if (!modal) {
            console.log('Equipment modal not found');
            return;
        }
        
        const equipment = this.equipmentData ? this.equipmentData.find(eq => eq.id == equipmentId) : null;
        
        if (!equipment) {
            console.log('Equipment not found for ID:', equipmentId);
            return;
        }

        // Update modal title
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = equipment.name;
        }

        // Update status metrics
        this.updateStatusMetrics(equipment);

        // Update maintenance timeline
        this.updateMaintenanceTimeline(equipmentId);

        // Create equipment detail chart
        this.createEquipmentDetailChart(equipmentId);

        modal.classList.add('active');
    }

    scheduleMaintenance(equipmentId) {
        console.log('Scheduling maintenance for equipment:', equipmentId);
        // Show maintenance scheduling modal or form
        alert(`Maintenance scheduled for Equipment ID: ${equipmentId}`);
    }

    showEquipmentSettings(equipmentId) {
        console.log('Showing settings for equipment:', equipmentId);
        // Show equipment settings modal
        alert(`Settings for Equipment ID: ${equipmentId}`);
    }

    updateStatusMetrics(equipment) {
        const container = document.getElementById('statusMetrics');
        if (!container) return;

        // Get latest sensor data for this equipment
        const sensorData = this.getLatestSensorData(equipment.id);
        
        container.innerHTML = `
            <div class="status-metric">
                <span class="label">Temperature:</span>
                <span class="value">${sensorData?.temperature || 'N/A'}°C</span>
            </div>
            <div class="status-metric">
                <span class="label">Efficiency:</span>
                <span class="value">${sensorData?.efficiency || 'N/A'}%</span>
            </div>
            <div class="status-metric">
                <span class="label">Power Consumption:</span>
                <span class="value">${sensorData?.power_consumption || 'N/A'}kW</span>
            </div>
            <div class="status-metric">
                <span class="label">Usage Hours:</span>
                <span class="value">${sensorData?.usage_hours || 'N/A'}h</span>
            </div>
        `;
    }

    updateMaintenanceTimeline(equipmentId) {
        const container = document.getElementById('maintenanceTimeline');
        if (!container) return;

        // Mock maintenance data
        const maintenanceData = [
            { date: '2024-03-01', type: 'Preventive', status: 'completed', description: 'Monthly calibration' },
            { date: '2024-02-15', type: 'Corrective', status: 'completed', description: 'Bearing replacement' },
            { date: '2024-04-15', type: 'Preventive', status: 'scheduled', description: 'Quarterly inspection' }
        ];

        container.innerHTML = maintenanceData.map(item => `
            <div class="timeline-item ${item.status}">
                <div class="timeline-date">${item.date}</div>
                <div class="timeline-content">
                    <h5>${item.type} Maintenance</h5>
                    <p>${item.description}</p>
                </div>
            </div>
        `).join('');
    }

    createEquipmentDetailChart(equipmentId) {
        const ctx = document.getElementById('equipmentDetailChart');
        if (!ctx) return;

        const data = {
            labels: this.generateTimeLabels(24),
            datasets: [{
                label: 'Temperature',
                data: this.generateRandomData(24, 30, 70),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4
            }, {
                label: 'Efficiency',
                data: this.generateRandomData(24, 80, 100),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                yAxisID: 'y1'
            }]
        };

        new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Temperature (°C)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Efficiency (%)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    }

    getLatestSensorData(equipmentId) {
        // Mock sensor data - in real implementation, this would come from API
        return {
            temperature: Math.floor(Math.random() * 40) + 30,
            efficiency: Math.floor(Math.random() * 20) + 80,
            power_consumption: (Math.random() * 10 + 5).toFixed(1),
            usage_hours: (Math.random() * 8 + 2).toFixed(1)
        };
    }

    handleEquipmentAction(action, equipmentId) {
        const equipment = this.equipmentData.find(eq => eq.id == equipmentId);
        const equipmentName = equipment ? equipment.name : `Equipment ${equipmentId}`;

        switch (action) {
            case 'view':
                this.showEquipmentModal(equipmentId);
                break;
            case 'settings':
                this.showActionFeedback(equipmentName, 'Settings opened');
                break;
            case 'analytics':
                this.showActionFeedback(equipmentName, 'Analytics opened');
                break;
        }
    }

    setupChartInteractions() {
        // Add chart period button handlers
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const period = e.target.getAttribute('data-period');
                const type = e.target.getAttribute('data-type');
                const equipment = e.target.getAttribute('data-equipment');
                const metric = e.target.getAttribute('data-metric');
                
                // Update button states
                e.target.parentElement.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update chart data
                this.updateChartData(period, type, equipment, metric);
            });
        });
    }

    updateChartData(period, type, equipment, metric) {
        // Update charts based on selected parameters
        console.log('Updating chart data:', { period, type, equipment, metric });
        
        // In a real implementation, this would fetch new data from the API
        // and update the respective charts
    }

    // Virtual Lab Controls
    setupVirtualLabControls() {
        console.log('Setting up virtual lab controls...');
        
        // Simulation controls
        document.getElementById('startSimulation')?.addEventListener('click', () => {
            this.startSimulation();
        });
        
        document.getElementById('pauseSimulation')?.addEventListener('click', () => {
            this.pauseSimulation();
        });
        
        document.getElementById('stopSimulation')?.addEventListener('click', () => {
            this.stopSimulation();
        });
        
        document.getElementById('resetSimulation')?.addEventListener('click', () => {
            this.resetSimulation();
        });

        // Control panel buttons
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                console.log('Virtual lab control clicked:', action);
                this.handleVirtualLabAction(action);
            });
        });

        // Simulation speed control
        const speedSlider = document.getElementById('simulationSpeed');
        const speedValue = document.getElementById('speedValue');
        
        if (speedSlider && speedValue) {
            speedSlider.addEventListener('input', (e) => {
                speedValue.textContent = e.target.value + 'x';
                this.setSimulationSpeed(parseFloat(e.target.value));
            });
        }

        // Training mode buttons
        document.querySelectorAll('.training-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.getAttribute('data-mode');
                this.selectTrainingMode(mode);
            });
        });
    }

    handleVirtualLabAction(action) {
        console.log('Handling virtual lab action:', action);
        
        switch(action) {
            case 'start':
                this.startSimulation();
                break;
            case 'pause':
                this.pauseSimulation();
                break;
            case 'reset':
                this.resetSimulation();
                break;
            default:
                console.log('Unknown virtual lab action:', action);
        }
    }

    startSimulation() {
        console.log('Starting simulation...');
        this.showActionFeedback('Virtual Lab', 'Simulation started');
        
        // Update HUD
        const hudActiveCount = document.getElementById('hudActiveCount');
        const hudTemperature = document.getElementById('hudTemperature');
        
        if (hudActiveCount) hudActiveCount.textContent = '8';
        if (hudTemperature) hudTemperature.textContent = '24°C';
        
        // Animate equipment
        this.animateEquipment();
        
        const hudSafety = document.getElementById('hudSafety');
        if (hudSafety) hudSafety.textContent = 'All Clear';
    }

    animateEquipment() {
        console.log('Animating equipment...');
        
        // Add animation classes to equipment
        const equipment = document.querySelectorAll('.cnc-machine, .robotic-arm, .conveyor-belt');
        equipment.forEach(eq => {
            eq.classList.add('animated');
        });
    }

    pauseSimulation() {
        console.log('Pausing simulation...');
        this.showActionFeedback('Virtual Lab', 'Simulation paused');
    }

    stopSimulation() {
        console.log('Stopping simulation...');
        this.showActionFeedback('Virtual Lab', 'Simulation stopped');
        // Reset HUD
        document.getElementById('hudActiveCount').textContent = '0';
        document.getElementById('hudTemperature').textContent = '22°C';
        document.getElementById('hudSafety').textContent = 'All Clear';
    }

    resetSimulation() {
        console.log('Resetting simulation...');
        this.showActionFeedback('Virtual Lab', 'Simulation reset');
        // Reset HUD
        document.getElementById('hudActiveCount').textContent = '0';
        document.getElementById('hudTemperature').textContent = '22°C';
        document.getElementById('hudSafety').textContent = 'All Clear';
    }

    setSimulationSpeed(speed) {
        console.log('Setting simulation speed to:', speed);
    }

    selectTrainingMode(mode) {
        console.log('Selected training mode:', mode);
        
        // Update button states
        document.querySelectorAll('.training-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`)?.classList.add('active');
        
        // Update progress
        const progress = document.getElementById('trainingProgress');
        const progressText = document.getElementById('progressText');
        
        if (progress && progressText) {
            const newProgress = Math.floor(Math.random() * 100);
            progress.style.width = newProgress + '%';
            progressText.textContent = newProgress + '% Complete';
        }
        
        this.showActionFeedback('Training Mode', `${mode} mode selected`);
    }

    // Training Simulator
    setupTrainingSimulator() {
        document.querySelectorAll('.scenario-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const scenario = e.currentTarget.getAttribute('data-scenario');
                this.selectTrainingScenario(scenario);
            });
        });
    }

    selectTrainingScenario(scenario) {
        console.log('Selected training scenario:', scenario);
        
        // Update card states
        document.querySelectorAll('.scenario-card').forEach(card => {
            card.classList.remove('active');
        });
        document.querySelector(`[data-scenario="${scenario}"]`)?.classList.add('active');
        
        // Update simulator screen
        const screen = document.getElementById('simulatorScreen');
        if (screen) {
            screen.innerHTML = `
                <div class="simulator-content">
                    <h3>${scenario.replace('-', ' ').toUpperCase()} Training</h3>
                    <p>Training scenario loaded successfully!</p>
                    <div class="training-interface">
                        <button class="training-action-btn">Start Training</button>
                        <button class="training-action-btn">View Instructions</button>
                    </div>
                </div>
            `;
        }
        
        this.showActionFeedback('Training Simulator', `${scenario} scenario selected`);
    }

    // AI Chat Setup
    setupAIChat() {
        const chatInput = document.getElementById('aiChatInput');
        const chatSend = document.getElementById('aiChatSend');
        const chatMessages = document.getElementById('aiChatMessages');
        const suggestionBtns = document.querySelectorAll('.suggestion-btn');

        if (chatSend) {
            chatSend.addEventListener('click', () => {
                this.sendAIMessage();
            });
        }

        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendAIMessage();
                }
            });
        }

        suggestionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const query = e.target.getAttribute('data-query');
                this.sendAIMessage(query);
            });
        });
    }

    sendAIMessage(message = null) {
        const chatInput = document.getElementById('aiChatInput');
        const chatMessages = document.getElementById('aiChatMessages');
        
        const userMessage = message || chatInput.value.trim();
        if (!userMessage) return;

        // Add user message
        this.addChatMessage(userMessage, 'user');
        
        // Clear input
        if (chatInput) chatInput.value = '';
        
        // Generate AI response
        setTimeout(() => {
            const aiResponse = this.generateAIResponse(userMessage);
            this.addChatMessage(aiResponse, 'ai');
        }, 1000);
    }

    addChatMessage(message, sender) {
        const chatMessages = document.getElementById('aiChatMessages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-content">
                <p>${message}</p>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    generateAIResponse(userMessage) {
        const responses = {
            'high temperature': 'I\'ve detected 3 equipment items with elevated temperatures. CNC Machine #2 shows 68°C, which is above the normal range. I recommend immediate inspection.',
            'maintenance': 'Based on the current data, I predict that Robot Arm #1 will need maintenance in 15 days. The efficiency trend shows a 5% decline over the past week.',
            'energy': 'Energy consumption analysis shows a 12% increase this month. The main contributors are the CNC machines in Lab A. Consider optimizing operating schedules.',
            'default': 'I understand you\'re asking about equipment monitoring. I can help you with temperature analysis, maintenance predictions, energy consumption, and performance insights. What specific aspect would you like to explore?'
        };

        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('temperature') || lowerMessage.includes('high')) {
            return responses['high temperature'];
        } else if (lowerMessage.includes('maintenance') || lowerMessage.includes('predict')) {
            return responses['maintenance'];
        } else if (lowerMessage.includes('energy') || lowerMessage.includes('consumption')) {
            return responses['energy'];
        } else {
            return responses['default'];
        }
    }

    // Gamification Interactions
    setupGamificationInteractions() {
        // Challenge interactions
        document.querySelectorAll('.challenge-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const challengeTitle = item.querySelector('h4').textContent;
                this.showActionFeedback('Challenge', `${challengeTitle} selected`);
            });
        });

        // Badge interactions
        document.querySelectorAll('.badge-item').forEach(badge => {
            badge.addEventListener('click', (e) => {
                const badgeTitle = badge.querySelector('h4').textContent;
                this.showActionFeedback('Badge', `${badgeTitle} badge details`);
            });
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.iotLabMonitor = new IoTLabMonitor();
});

// Global functions for HTML onclick handlers
function scrollToSection(sectionId) {
    console.log('Global scrollToSection called with:', sectionId);
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => scrollToSection(sectionId));
        return;
    }
    
    if (window.iotLabMonitor) {
        window.iotLabMonitor.scrollToSection(sectionId);
    } else {
        console.log('iotLabMonitor not initialized yet, using fallback');
        // Fallback: direct scroll to section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        } else {
            console.error('Section not found:', sectionId);
        }
    }
}