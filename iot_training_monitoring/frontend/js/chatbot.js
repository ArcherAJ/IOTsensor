// AI Chatbot Integration
class AIChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.currentUserId = 1; // Default user ID
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadChatHistory();
    }

    setupEventListeners() {
        // Chatbot toggle button
        const toggleBtn = document.getElementById('chatbotToggleBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }

        // Close chatbot button
        const closeBtn = document.getElementById('chatbotToggle');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Send message button
        const sendBtn = document.getElementById('chatbotSend');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        // Enter key in input
        const input = document.getElementById('chatbotInput');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
    }

    toggle() {
        const container = document.getElementById('chatbotContainer');
        if (container) {
            container.classList.toggle('active');
            this.isOpen = container.classList.contains('active');
            
            if (this.isOpen) {
                this.focusInput();
            }
        }
    }

    close() {
        const container = document.getElementById('chatbotContainer');
        if (container) {
            container.classList.remove('active');
            this.isOpen = false;
        }
    }

    focusInput() {
        const input = document.getElementById('chatbotInput');
        if (input) {
            setTimeout(() => input.focus(), 100);
        }
    }

    async sendMessage() {
        const input = document.getElementById('chatbotInput');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message to chat
        this.addMessage(message, true);
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Send message to backend
            const response = await fetch('/api/chatbot/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    user_id: this.currentUserId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const aiResponse = await response.json();
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Add AI response to chat
            this.addMessage(aiResponse.message, false);
            
        } catch (error) {
            console.error('Error sending message to chatbot:', error);
            this.hideTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again later.', false);
        }
    }

    addMessage(content, isUser = true) {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        
        messageElement.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${isUser ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-content">
                <p>${content}</p>
                <span class="message-time">${new Date().toLocaleTimeString()}</span>
            </div>
        `;

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Store message
        this.messages.push({
            content: content,
            isUser: isUser,
            timestamp: new Date().toISOString()
        });
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;

        const typingElement = document.createElement('div');
        typingElement.className = 'message ai-message typing-indicator';
        typingElement.id = 'typing-indicator';
        
        typingElement.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingElement = document.getElementById('typing-indicator');
        if (typingElement) {
            typingElement.remove();
        }
    }

    async loadChatHistory() {
        try {
            const response = await fetch(`/api/chatbot/history/${this.currentUserId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const history = await response.json();
            
            // Clear existing messages
            const messagesContainer = document.getElementById('chatbotMessages');
            if (messagesContainer) {
                messagesContainer.innerHTML = '';
            }
            
            // Add welcome message
            this.addMessage('Hello! I\'m your AI assistant. How can I help you with equipment monitoring today?', false);
            
            // Load chat history
            history.forEach(msg => {
                this.addMessage(msg.message, !msg.is_ai_response);
            });
            
        } catch (error) {
            console.error('Error loading chat history:', error);
            // Add welcome message even if history fails to load
            this.addMessage('Hello! I\'m your AI assistant. How can I help you with equipment monitoring today?', false);
        }
    }

    // Quick action buttons for common queries
    addQuickActions() {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;

        const quickActionsElement = document.createElement('div');
        quickActionsElement.className = 'quick-actions';
        quickActionsElement.innerHTML = `
            <div class="quick-action-buttons">
                <button class="quick-action-btn" onclick="chatbot.sendQuickMessage('Show me equipment status')">
                    <i class="fas fa-chart-bar"></i>
                    Equipment Status
                </button>
                <button class="quick-action-btn" onclick="chatbot.sendQuickMessage('Help with troubleshooting')">
                    <i class="fas fa-wrench"></i>
                    Troubleshooting
                </button>
                <button class="quick-action-btn" onclick="chatbot.sendQuickMessage('Schedule maintenance')">
                    <i class="fas fa-calendar"></i>
                    Schedule Maintenance
                </button>
                <button class="quick-action-btn" onclick="chatbot.sendQuickMessage('Safety protocols')">
                    <i class="fas fa-shield-alt"></i>
                    Safety Info
                </button>
            </div>
        `;

        messagesContainer.appendChild(quickActionsElement);
    }

    sendQuickMessage(message) {
        const input = document.getElementById('chatbotInput');
        if (input) {
            input.value = message;
            this.sendMessage();
        }
    }

    // Handle different types of AI responses
    handleAIResponse(response) {
        if (response.type === 'equipment_status') {
            this.displayEquipmentStatus(response.data);
        } else if (response.type === 'maintenance_schedule') {
            this.displayMaintenanceSchedule(response.data);
        } else if (response.type === 'troubleshooting_steps') {
            this.displayTroubleshootingSteps(response.data);
        } else {
            this.addMessage(response.message, false);
        }
    }

    displayEquipmentStatus(data) {
        const statusHtml = `
            <div class="equipment-status-response">
                <h4>Equipment Status</h4>
                <div class="status-grid">
                    ${data.map(eq => `
                        <div class="status-item">
                            <span class="equipment-name">${eq.name}</span>
                            <span class="status-badge ${eq.status}">${eq.status}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        this.addMessage(statusHtml, false);
    }

    displayMaintenanceSchedule(data) {
        const scheduleHtml = `
            <div class="maintenance-schedule-response">
                <h4>Maintenance Schedule</h4>
                <div class="schedule-list">
                    ${data.map(item => `
                        <div class="schedule-item">
                            <span class="equipment-name">${item.equipment_name}</span>
                            <span class="schedule-date">${item.scheduled_date}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        this.addMessage(scheduleHtml, false);
    }

    displayTroubleshootingSteps(data) {
        const stepsHtml = `
            <div class="troubleshooting-response">
                <h4>Troubleshooting Steps</h4>
                <ol class="troubleshooting-steps">
                    ${data.steps.map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>
        `;
        this.addMessage(stepsHtml, false);
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatbot = new AIChatbot();
});

// Add CSS for chatbot enhancements
const chatbotStyles = `
<style>
.quick-actions {
    margin: 1rem 0;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
}

.quick-action-buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
}

.quick-action-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    padding: 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
}

.quick-action-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

.typing-indicator .typing-dots {
    display: flex;
    gap: 0.25rem;
    align-items: center;
}

.typing-dots span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
    0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
    40% { transform: scale(1); opacity: 1; }
}

.equipment-status-response,
.maintenance-schedule-response,
.troubleshooting-response {
    background: rgba(255, 255, 255, 0.1);
    padding: 1rem;
    border-radius: 8px;
    margin: 0.5rem 0;
}

.equipment-status-response h4,
.maintenance-schedule-response h4,
.troubleshooting-response h4 {
    margin-bottom: 0.5rem;
    font-size: 1rem;
}

.status-grid {
    display: grid;
    gap: 0.5rem;
}

.status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
}

.status-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
}

.status-badge.active { background: #27ae60; color: white; }
.status-badge.idle { background: #f39c12; color: white; }
.status-badge.offline { background: #e74c3c; color: white; }

.schedule-list {
    display: grid;
    gap: 0.5rem;
}

.schedule-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
}

.troubleshooting-steps {
    padding-left: 1rem;
}

.troubleshooting-steps li {
    margin-bottom: 0.5rem;
    line-height: 1.4;
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', chatbotStyles);