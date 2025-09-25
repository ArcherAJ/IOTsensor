class EquipmentManager {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8000';
        this.init();
    }

    async init() {
        await this.loadEquipmentData();
    }

    async loadEquipmentData() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/equipment`);
            const equipment = await response.json();
            
            this.renderEquipmentList(equipment);
            this.renderStatusDistribution(equipment);
            this.renderTypeDistribution(equipment);

        } catch (error) {
            console.error('Error loading equipment data:', error);
        }
    }

    renderEquipmentList(equipment) {
        const equipmentList = document.getElementById('equipmentList');
        
        equipmentList.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Location</th>
                        <th>Last Maintenance</th>
                        <th>Next Maintenance</th>
                    </tr>
                </thead>
                <tbody>
                    ${equipment.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.type}</td>
                            <td>
                                <span class="status-indicator ${utils.getStatusClass(item.status)}"></span>
                                ${item.status}
                            </td>
                            <td>${item.location}</td>
                            <td>${utils.formatDate(item.last_maintenance)}</td>
                            <td>${utils.formatDate(item.next_maintenance)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderStatusDistribution(equipment) {
        const statusCount = {};
        equipment.forEach(item => {
            statusCount[item.status] = (statusCount[item.status] || 0) + 1;
        });

        const statusDiv = document.getElementById('statusDistribution');
        statusDiv.innerHTML = Object.entries(statusCount).map(([status, count]) => `
            <div style="display: flex; justify-content: space-between; margin: 0.5rem 0;">
                <span>
                    <span class="status-indicator ${utils.getStatusClass(status)}"></span>
                    ${status}
                </span>
                <strong>${count}</strong>
            </div>
        `).join('');
    }

    renderTypeDistribution(equipment) {
        const typeCount = {};
        equipment.forEach(item => {
            typeCount[item.type] = (typeCount[item.type] || 0) + 1;
        });

        const typeDiv = document.getElementById('typeDistribution');
        typeDiv.innerHTML = Object.entries(typeCount).map(([type, count]) => `
            <div style="display: flex; justify-content: space-between; margin: 0.5rem 0;">
                <span>${type}</span>
                <strong>${count}</strong>
            </div>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EquipmentManager();
});