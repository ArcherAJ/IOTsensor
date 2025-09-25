// Virtual Lab 3D Environment
class VirtualLab3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.equipment = [];
        this.controls = null;
        this.isInitialized = false;
        this.currentEnvironment = 'manufacturing';
        this.currentScenario = 'troubleshooting';
    }

    async initialize() {
        if (this.isInitialized) return;

        const container = document.getElementById('three-container');
        if (!container) return;

        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(10, 10, 10);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);

        // Add lighting
        this.setupLighting();

        // Add environment
        await this.loadEnvironment(this.currentEnvironment);

        // Add controls
        this.setupControls();

        // Start render loop
        this.animate();

        this.isInitialized = true;
        this.hideLoadingSpinner();
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Point light
        const pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
        pointLight.position.set(-10, 10, -10);
        this.scene.add(pointLight);
    }

    async loadEnvironment(environmentType) {
        // Clear existing equipment
        this.equipment.forEach(obj => this.scene.remove(obj));
        this.equipment = [];

        // Add floor
        this.addFloor();

        // Load environment-specific equipment
        switch (environmentType) {
            case 'manufacturing':
                await this.loadManufacturingLab();
                break;
            case 'automotive':
                await this.loadAutomotiveLab();
                break;
            case 'renewable':
                await this.loadRenewableLab();
                break;
        }
    }

    addFloor() {
        const floorGeometry = new THREE.PlaneGeometry(50, 50);
        const floorMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x888888,
            transparent: true,
            opacity: 0.8
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
    }

    async loadManufacturingLab() {
        // CNC Machine
        const cncMachine = await this.createCNCMachine();
        cncMachine.position.set(0, 0, 0);
        cncMachine.userData = { type: 'cnc', id: 1, name: 'CNC Machine #1' };
        this.scene.add(cncMachine);
        this.equipment.push(cncMachine);

        // Robot Arm
        const robotArm = await this.createRobotArm();
        robotArm.position.set(8, 0, 0);
        robotArm.userData = { type: 'robot', id: 2, name: 'Robot Arm #1' };
        this.scene.add(robotArm);
        this.equipment.push(robotArm);

        // Quality Control Station
        const qcStation = await this.createQCStation();
        qcStation.position.set(-8, 0, 0);
        qcStation.userData = { type: 'qc', id: 3, name: 'QC Station #1' };
        this.scene.add(qcStation);
        this.equipment.push(qcStation);
    }

    async loadAutomotiveLab() {
        // Engine Diagnostic Station
        const diagnosticStation = await this.createDiagnosticStation();
        diagnosticStation.position.set(0, 0, 0);
        diagnosticStation.userData = { type: 'diagnostic', id: 4, name: 'Engine Diagnostic Station' };
        this.scene.add(diagnosticStation);
        this.equipment.push(diagnosticStation);

        // Hybrid Vehicle Trainer
        const hybridTrainer = await this.createHybridTrainer();
        hybridTrainer.position.set(8, 0, 0);
        hybridTrainer.userData = { type: 'hybrid', id: 5, name: 'Hybrid Vehicle Trainer' };
        this.scene.add(hybridTrainer);
        this.equipment.push(hybridTrainer);
    }

    async loadRenewableLab() {
        // Solar Panel Array
        const solarArray = await this.createSolarArray();
        solarArray.position.set(0, 0, 0);
        solarArray.userData = { type: 'solar', id: 6, name: 'Solar Panel Array' };
        this.scene.add(solarArray);
        this.equipment.push(solarArray);

        // Wind Turbine
        const windTurbine = await this.createWindTurbine();
        windTurbine.position.set(8, 0, 0);
        windTurbine.userData = { type: 'wind', id: 7, name: 'Wind Turbine Simulator' };
        this.scene.add(windTurbine);
        this.equipment.push(windTurbine);
    }

    async createCNCMachine() {
        const group = new THREE.Group();

        // Base
        const baseGeometry = new THREE.BoxGeometry(3, 0.5, 2);
        const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.25;
        base.castShadow = true;
        group.add(base);

        // Column
        const columnGeometry = new THREE.BoxGeometry(0.5, 2, 0.5);
        const columnMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const column = new THREE.Mesh(columnGeometry, columnMaterial);
        column.position.set(1, 1.25, 0);
        column.castShadow = true;
        group.add(column);

        // Spindle
        const spindleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5);
        const spindleMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const spindle = new THREE.Mesh(spindleGeometry, spindleMaterial);
        spindle.position.set(1, 2.5, 0);
        spindle.castShadow = true;
        group.add(spindle);

        // Workpiece
        const workpieceGeometry = new THREE.BoxGeometry(1, 0.2, 1);
        const workpieceMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
        const workpiece = new THREE.Mesh(workpieceGeometry, workpieceMaterial);
        workpiece.position.set(0, 0.6, 0);
        group.add(workpiece);

        return group;
    }

    async createRobotArm() {
        const group = new THREE.Group();

        // Base
        const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3);
        const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.15;
        base.castShadow = true;
        group.add(base);

        // Arm segments
        const armGeometry = new THREE.BoxGeometry(0.2, 1, 0.2);
        const armMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });

        const arm1 = new THREE.Mesh(armGeometry, armMaterial);
        arm1.position.set(0, 0.8, 0);
        arm1.castShadow = true;
        group.add(arm1);

        const arm2 = new THREE.Mesh(armGeometry, armMaterial);
        arm2.position.set(0, 1.6, 0);
        arm2.castShadow = true;
        group.add(arm2);

        // End effector
        const effectorGeometry = new THREE.SphereGeometry(0.15);
        const effectorMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const effector = new THREE.Mesh(effectorGeometry, effectorMaterial);
        effector.position.set(0, 2.2, 0);
        effector.castShadow = true;
        group.add(effector);

        return group;
    }

    async createQCStation() {
        const group = new THREE.Group();

        // Table
        const tableGeometry = new THREE.BoxGeometry(2, 0.1, 1);
        const tableMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const table = new THREE.Mesh(tableGeometry, tableMaterial);
        table.position.y = 0.05;
        table.castShadow = true;
        group.add(table);

        // Computer monitor
        const monitorGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.05);
        const monitorMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
        monitor.position.set(0.5, 0.3, 0);
        group.add(monitor);

        // Measurement tools
        const toolGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3);
        const toolMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
        const tool = new THREE.Mesh(toolGeometry, toolMaterial);
        tool.position.set(-0.5, 0.2, 0);
        tool.rotation.z = Math.PI / 2;
        group.add(tool);

        return group;
    }

    async createDiagnosticStation() {
        const group = new THREE.Group();

        // Workbench
        const benchGeometry = new THREE.BoxGeometry(3, 0.1, 1.5);
        const benchMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const bench = new THREE.Mesh(benchGeometry, benchMaterial);
        bench.position.y = 0.05;
        bench.castShadow = true;
        group.add(bench);

        // Engine block
        const engineGeometry = new THREE.BoxGeometry(1, 0.8, 0.6);
        const engineMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const engine = new THREE.Mesh(engineGeometry, engineMaterial);
        engine.position.set(0, 0.5, 0);
        engine.castShadow = true;
        group.add(engine);

        // Diagnostic computer
        const computerGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.2);
        const computerMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const computer = new THREE.Mesh(computerGeometry, computerMaterial);
        computer.position.set(1, 0.25, 0);
        group.add(computer);

        return group;
    }

    async createHybridTrainer() {
        const group = new THREE.Group();

        // Vehicle chassis
        const chassisGeometry = new THREE.BoxGeometry(4, 0.3, 2);
        const chassisMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const chassis = new THREE.Mesh(chassisGeometry, chassisMaterial);
        chassis.position.y = 0.15;
        chassis.castShadow = true;
        group.add(chassis);

        // Battery pack
        const batteryGeometry = new THREE.BoxGeometry(1, 0.4, 0.8);
        const batteryMaterial = new THREE.MeshLambertMaterial({ color: 0x0066cc });
        const battery = new THREE.Mesh(batteryGeometry, batteryMaterial);
        battery.position.set(-1, 0.4, 0);
        group.add(battery);

        // Electric motor
        const motorGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.4);
        const motorMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const motor = new THREE.Mesh(motorGeometry, motorMaterial);
        motor.position.set(1, 0.3, 0);
        motor.rotation.z = Math.PI / 2;
        group.add(motor);

        return group;
    }

    async createSolarArray() {
        const group = new THREE.Group();

        // Solar panels
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 2; j++) {
                const panelGeometry = new THREE.BoxGeometry(1, 0.05, 0.5);
                const panelMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
                const panel = new THREE.Mesh(panelGeometry, panelMaterial);
                panel.position.set(i * 1.1 - 1.1, 0.025, j * 0.6 - 0.3);
                panel.rotation.x = -Math.PI / 6; // Tilt towards sun
                group.add(panel);
            }
        }

        // Support structure
        const supportGeometry = new THREE.BoxGeometry(0.1, 1, 0.1);
        const supportMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const support = new THREE.Mesh(supportGeometry, supportMaterial);
        support.position.set(0, -0.5, 0);
        group.add(support);

        return group;
    }

    async createWindTurbine() {
        const group = new THREE.Group();

        // Tower
        const towerGeometry = new THREE.CylinderGeometry(0.2, 0.3, 3);
        const towerMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const tower = new THREE.Mesh(towerGeometry, towerMaterial);
        tower.position.y = 1.5;
        tower.castShadow = true;
        group.add(tower);

        // Nacelle
        const nacelleGeometry = new THREE.BoxGeometry(0.8, 0.4, 0.6);
        const nacelleMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const nacelle = new THREE.Mesh(nacelleGeometry, nacelleMaterial);
        nacelle.position.set(0, 3.2, 0);
        group.add(nacelle);

        // Blades
        const bladeGeometry = new THREE.BoxGeometry(2, 0.1, 0.3);
        const bladeMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });

        for (let i = 0; i < 3; i++) {
            const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
            blade.position.set(0, 3.2, 0);
            blade.rotation.y = (i * Math.PI * 2) / 3;
            blade.rotation.z = Math.PI / 6; // Blade angle
            group.add(blade);
        }

        return group;
    }

    setupControls() {
        // Simple orbit controls simulation
        let isMouseDown = false;
        let mouseX = 0, mouseY = 0;

        this.renderer.domElement.addEventListener('mousedown', (event) => {
            isMouseDown = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
        });

        this.renderer.domElement.addEventListener('mouseup', () => {
            isMouseDown = false;
        });

        this.renderer.domElement.addEventListener('mousemove', (event) => {
            if (!isMouseDown) return;

            const deltaX = event.clientX - mouseX;
            const deltaY = event.clientY - mouseY;

            this.camera.position.x += deltaX * 0.01;
            this.camera.position.y -= deltaY * 0.01;
            this.camera.lookAt(0, 0, 0);

            mouseX = event.clientX;
            mouseY = event.clientY;
        });

        // Mouse click detection for equipment interaction
        this.renderer.domElement.addEventListener('click', (event) => {
            const mouse = new THREE.Vector2();
            mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
            mouse.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, this.camera);

            const intersects = raycaster.intersectObjects(this.equipment, true);
            if (intersects.length > 0) {
                const equipment = intersects[0].object.parent;
                this.handleEquipmentClick(equipment);
            }
        });
    }

    handleEquipmentClick(equipment) {
        const userData = equipment.userData;
        if (userData) {
            this.showEquipmentInfo(userData);
            this.highlightEquipment(equipment);
        }
    }

    showEquipmentInfo(equipmentData) {
        const infoPanel = document.querySelector('.equipment-info-panel .info-content');
        if (infoPanel) {
            infoPanel.innerHTML = `
                <h5>${equipmentData.name}</h5>
                <p><strong>Type:</strong> ${equipmentData.type}</p>
                <p><strong>Status:</strong> Active</p>
                <p><strong>Temperature:</strong> 45°C</p>
                <p><strong>Efficiency:</strong> 92%</p>
                <button class="action-btn primary">View Details</button>
            `;
        }
    }

    highlightEquipment(equipment) {
        // Remove previous highlights
        this.equipment.forEach(eq => {
            eq.traverse((child) => {
                if (child.isMesh) {
                    child.material.emissive.setHex(0x000000);
                }
            });
        });

        // Highlight selected equipment
        equipment.traverse((child) => {
            if (child.isMesh) {
                child.material.emissive.setHex(0x444444);
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Rotate equipment slightly for visual interest
        this.equipment.forEach(equipment => {
            if (equipment.userData.type === 'robot') {
                equipment.rotation.y += 0.01;
            }
        });

        this.renderer.render(this.scene, this.camera);
    }

    hideLoadingSpinner() {
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) {
            spinner.style.display = 'none';
        }
    }

    resize() {
        if (!this.isInitialized) return;

        const container = document.getElementById('three-container');
        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}

// Initialize virtual lab when section is shown
document.addEventListener('DOMContentLoaded', () => {
    const virtualLab = new VirtualLab3D();
    
    // Initialize when virtual lab section is shown
    const virtualLabSection = document.getElementById('virtual-lab');
    if (virtualLabSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    virtualLab.initialize();
                }
            });
        });
        observer.observe(virtualLabSection);
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        virtualLab.resize();
    });
});
