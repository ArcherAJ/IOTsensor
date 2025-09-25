import json
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from models import ChatMessage, Notification, User, AlertSeverity, Equipment
import random

class AIChatbot:
    def __init__(self):
        self.knowledge_base = self._initialize_knowledge_base()
        self.conversation_context = {}
        
    def _initialize_knowledge_base(self) -> Dict[str, Any]:
        """Initialize chatbot knowledge base"""
        return {
            "equipment_troubleshooting": {
                "temperature_high": {
                    "symptoms": ["high temperature", "overheating", "thermal"],
                    "solutions": [
                        "Check cooling system",
                        "Verify proper ventilation",
                        "Inspect thermal sensors",
                        "Schedule maintenance"
                    ],
                    "urgency": "high"
                },
                "vibration_excessive": {
                    "symptoms": ["vibration", "shaking", "unstable"],
                    "solutions": [
                        "Check mechanical alignment",
                        "Inspect bearings",
                        "Verify mounting bolts",
                        "Schedule mechanical inspection"
                    ],
                    "urgency": "medium"
                },
                "power_consumption_high": {
                    "symptoms": ["high power", "energy consumption", "efficiency"],
                    "solutions": [
                        "Check equipment settings",
                        "Inspect for mechanical issues",
                        "Verify calibration",
                        "Consider equipment upgrade"
                    ],
                    "urgency": "medium"
                },
                "efficiency_low": {
                    "symptoms": ["low efficiency", "poor performance", "ineffective"],
                    "solutions": [
                        "Check equipment calibration",
                        "Inspect for wear and tear",
                        "Review operational procedures",
                        "Schedule maintenance"
                    ],
                    "urgency": "medium"
                }
            },
            "maintenance_guidance": {
                "preventive": [
                    "Regular cleaning and inspection",
                    "Lubrication of moving parts",
                    "Calibration verification",
                    "Safety system testing"
                ],
                "corrective": [
                    "Identify root cause",
                    "Replace worn components",
                    "Adjust settings",
                    "Test functionality"
                ],
                "predictive": [
                    "Monitor sensor data trends",
                    "Schedule maintenance based on predictions",
                    "Prevent unexpected failures",
                    "Optimize maintenance intervals"
                ]
            },
            "safety_protocols": {
                "emergency_stop": [
                    "Immediately press emergency stop button",
                    "Clear the area of personnel",
                    "Report incident to supervisor",
                    "Document the incident"
                ],
                "safety_interlock": [
                    "Check all safety guards are in place",
                    "Verify interlock switches are functioning",
                    "Do not bypass safety systems",
                    "Report any issues immediately"
                ],
                "personal_protective_equipment": [
                    "Wear appropriate PPE",
                    "Check PPE condition before use",
                    "Follow manufacturer guidelines",
                    "Replace damaged PPE immediately"
                ]
            },
            "general_responses": {
                "greeting": [
                    "Hello! I'm your AI assistant for equipment monitoring. How can I help you today?",
                    "Hi there! I'm here to help with equipment issues and questions. What's on your mind?",
                    "Welcome! I can assist with troubleshooting, maintenance guidance, and safety protocols."
                ],
                "help": [
                    "I can help you with equipment troubleshooting, maintenance guidance, safety protocols, and general questions about the monitoring system.",
                    "I'm here to assist with equipment issues, maintenance scheduling, safety concerns, and system navigation.",
                    "I can provide guidance on equipment operation, troubleshooting, maintenance, and safety procedures."
                ],
                "unknown": [
                    "I'm not sure I understand that. Could you provide more details about your equipment issue?",
                    "I need more information to help you effectively. What specific equipment or problem are you referring to?",
                    "Let me help you better. Can you describe the equipment issue or question you have?"
                ]
            }
        }
    
    async def process_message(self, user_message: str, user_id: int, equipment_id: Optional[int] = None) -> ChatMessage:
        """Process user message and generate AI response"""
        # Analyze user message
        intent = self._analyze_intent(user_message)
        context = self._get_context(user_id, equipment_id)
        
        # Generate response based on intent
        response_text = await self._generate_response(intent, user_message, context)
        
        # Create chat message
        chat_message = ChatMessage(
            id=random.randint(1000, 9999),
            user_id=user_id,
            message=response_text,
            timestamp=datetime.now().isoformat(),
            is_ai_response=True,
            context={
                "intent": intent,
                "equipment_id": equipment_id,
                "confidence": 0.85
            },
            equipment_id=equipment_id,
            resolved=False
        )
        
        return chat_message
    
    def _analyze_intent(self, message: str) -> str:
        """Analyze user message to determine intent"""
        message_lower = message.lower()
        
        # Greeting detection
        if any(word in message_lower for word in ["hello", "hi", "hey", "good morning", "good afternoon"]):
            return "greeting"
        
        # Help request
        if any(word in message_lower for word in ["help", "assist", "support", "how to"]):
            return "help"
        
        # Equipment troubleshooting
        if any(word in message_lower for word in ["problem", "issue", "not working", "broken", "fault", "error"]):
            return "troubleshooting"
        
        # Temperature issues
        if any(word in message_lower for word in ["temperature", "hot", "overheating", "thermal"]):
            return "temperature_issue"
        
        # Vibration issues
        if any(word in message_lower for word in ["vibration", "shaking", "unstable", "wobbling"]):
            return "vibration_issue"
        
        # Power issues
        if any(word in message_lower for word in ["power", "energy", "consumption", "efficiency"]):
            return "power_issue"
        
        # Maintenance questions
        if any(word in message_lower for word in ["maintenance", "service", "repair", "fix"]):
            return "maintenance"
        
        # Safety concerns
        if any(word in message_lower for word in ["safety", "dangerous", "unsafe", "emergency"]):
            return "safety"
        
        # General questions
        if any(word in message_lower for word in ["what", "how", "when", "where", "why"]):
            return "general_question"
        
        return "unknown"
    
    def _get_context(self, user_id: int, equipment_id: Optional[int]) -> Dict[str, Any]:
        """Get context for the conversation"""
        context = {
            "user_id": user_id,
            "equipment_id": equipment_id,
            "timestamp": datetime.now().isoformat()
        }
        
        # Add equipment-specific context if available
        if equipment_id:
            context["equipment_context"] = {
                "id": equipment_id,
                "recent_alerts": [],
                "maintenance_status": "unknown",
                "last_inspection": "unknown"
            }
        
        return context
    
    async def _generate_response(self, intent: str, user_message: str, context: Dict[str, Any]) -> str:
        """Generate AI response based on intent and context"""
        
        if intent == "greeting":
            responses = self.knowledge_base["general_responses"]["greeting"]
            return random.choice(responses)
        
        elif intent == "help":
            responses = self.knowledge_base["general_responses"]["help"]
            return random.choice(responses)
        
        elif intent == "troubleshooting":
            return await self._handle_troubleshooting(user_message, context)
        
        elif intent == "temperature_issue":
            return await self._handle_temperature_issue(user_message, context)
        
        elif intent == "vibration_issue":
            return await self._handle_vibration_issue(user_message, context)
        
        elif intent == "power_issue":
            return await self._handle_power_issue(user_message, context)
        
        elif intent == "maintenance":
            return await self._handle_maintenance_question(user_message, context)
        
        elif intent == "safety":
            return await self._handle_safety_concern(user_message, context)
        
        elif intent == "general_question":
            return await self._handle_general_question(user_message, context)
        
        else:
            responses = self.knowledge_base["general_responses"]["unknown"]
            return random.choice(responses)
    
    async def _handle_troubleshooting(self, message: str, context: Dict[str, Any]) -> str:
        """Handle equipment troubleshooting requests"""
        equipment_id = context.get("equipment_id")
        
        response = "I can help you troubleshoot equipment issues. "
        
        if equipment_id:
            response += f"For equipment ID {equipment_id}, I recommend:\n\n"
        else:
            response += "Please specify which equipment you're having issues with. "
        
        response += "Common troubleshooting steps include:\n"
        response += "1. Check all safety systems are functioning\n"
        response += "2. Verify equipment is properly calibrated\n"
        response += "3. Inspect for visible damage or wear\n"
        response += "4. Review recent maintenance logs\n"
        response += "5. Check sensor readings for anomalies\n\n"
        response += "Can you provide more specific details about the problem you're experiencing?"
        
        return response
    
    async def _handle_temperature_issue(self, message: str, context: Dict[str, Any]) -> str:
        """Handle temperature-related issues"""
        troubleshooting_info = self.knowledge_base["equipment_troubleshooting"]["temperature_high"]
        
        response = "I understand you're experiencing temperature issues. Here's what I recommend:\n\n"
        
        for i, solution in enumerate(troubleshooting_info["solutions"], 1):
            response += f"{i}. {solution}\n"
        
        response += f"\nThis is a {troubleshooting_info['urgency']} priority issue. "
        response += "If the temperature continues to rise, please activate the emergency stop immediately and contact maintenance."
        
        return response
    
    async def _handle_vibration_issue(self, message: str, context: Dict[str, Any]) -> str:
        """Handle vibration-related issues"""
        troubleshooting_info = self.knowledge_base["equipment_troubleshooting"]["vibration_excessive"]
        
        response = "Excessive vibration can indicate mechanical issues. Here's my recommended action plan:\n\n"
        
        for i, solution in enumerate(troubleshooting_info["solutions"], 1):
            response += f"{i}. {solution}\n"
        
        response += f"\nThis is a {troubleshooting_info['urgency']} priority issue. "
        response += "Continued operation with excessive vibration may cause further damage."
        
        return response
    
    async def _handle_power_issue(self, message: str, context: Dict[str, Any]) -> str:
        """Handle power consumption issues"""
        troubleshooting_info = self.knowledge_base["equipment_troubleshooting"]["power_consumption_high"]
        
        response = "High power consumption can affect efficiency and costs. Here's what to check:\n\n"
        
        for i, solution in enumerate(troubleshooting_info["solutions"], 1):
            response += f"{i}. {solution}\n"
        
        response += f"\nThis is a {troubleshooting_info['urgency']} priority issue. "
        response += "Monitoring power consumption trends can help identify optimization opportunities."
        
        return response
    
    async def _handle_maintenance_question(self, message: str, context: Dict[str, Any]) -> str:
        """Handle maintenance-related questions"""
        response = "I can help with maintenance guidance. Here are the main types of maintenance:\n\n"
        
        response += "**Preventive Maintenance:**\n"
        for item in self.knowledge_base["maintenance_guidance"]["preventive"]:
            response += f"• {item}\n"
        
        response += "\n**Corrective Maintenance:**\n"
        for item in self.knowledge_base["maintenance_guidance"]["corrective"]:
            response += f"• {item}\n"
        
        response += "\n**Predictive Maintenance:**\n"
        for item in self.knowledge_base["maintenance_guidance"]["predictive"]:
            response += f"• {item}\n"
        
        response += "\nWhat specific maintenance question do you have?"
        
        return response
    
    async def _handle_safety_concern(self, message: str, context: Dict[str, Any]) -> str:
        """Handle safety-related concerns"""
        response = "Safety is our top priority. Here are key safety protocols:\n\n"
        
        response += "**Emergency Stop:**\n"
        for item in self.knowledge_base["safety_protocols"]["emergency_stop"]:
            response += f"• {item}\n"
        
        response += "\n**Safety Interlocks:**\n"
        for item in self.knowledge_base["safety_protocols"]["safety_interlock"]:
            response += f"• {item}\n"
        
        response += "\n**Personal Protective Equipment:**\n"
        for item in self.knowledge_base["safety_protocols"]["personal_protective_equipment"]:
            response += f"• {item}\n"
        
        response += "\nIf this is an emergency, please activate the emergency stop immediately and contact your supervisor."
        
        return response
    
    async def _handle_general_question(self, message: str, context: Dict[str, Any]) -> str:
        """Handle general questions"""
        response = "I'm here to help with equipment monitoring and maintenance questions. "
        response += "I can assist with:\n\n"
        response += "• Equipment troubleshooting\n"
        response += "• Maintenance guidance\n"
        response += "• Safety protocols\n"
        response += "• System navigation\n"
        response += "• Performance optimization\n\n"
        response += "What specific information are you looking for?"
        
        return response

class NotificationEngine:
    def __init__(self):
        self.notification_templates = self._initialize_notification_templates()
        
    def _initialize_notification_templates(self) -> Dict[str, Dict[str, Any]]:
        """Initialize notification templates"""
        return {
            "equipment_alert": {
                "title": "Equipment Alert: {equipment_name}",
                "message": "{alert_message}",
                "priority": "high",
                "type": "equipment"
            },
            "maintenance_due": {
                "title": "Maintenance Due: {equipment_name}",
                "message": "Scheduled maintenance is due for {equipment_name}. Please coordinate with maintenance team.",
                "priority": "medium",
                "type": "maintenance"
            },
            "safety_alert": {
                "title": "Safety Alert: {location}",
                "message": "{safety_message}",
                "priority": "critical",
                "type": "safety"
            },
            "achievement_unlocked": {
                "title": "Achievement Unlocked! 🏆",
                "message": "Congratulations! You've earned the '{badge_name}' badge.",
                "priority": "low",
                "type": "gamification"
            },
            "ai_insight": {
                "title": "AI Insight Available",
                "message": "New AI insight: {insight_title}",
                "priority": "medium",
                "type": "ai_insight"
            },
            "system_update": {
                "title": "System Update",
                "message": "{update_message}",
                "priority": "low",
                "type": "system"
            }
        }
    
    def create_notification(self, template_type: str, user_id: int, **kwargs) -> Notification:
        """Create a notification using template"""
        if template_type not in self.notification_templates:
            raise ValueError(f"Unknown notification template: {template_type}")
        
        template = self.notification_templates[template_type]
        
        # Format message with provided data
        title = template["title"].format(**kwargs)
        message = template["message"].format(**kwargs)
        
        notification = Notification(
            id=random.randint(1000, 9999),
            user_id=user_id,
            title=title,
            message=message,
            type=template["type"],
            priority=AlertSeverity(template["priority"]),
            timestamp=datetime.now().isoformat(),
            read=False,
            action_url=kwargs.get("action_url"),
            equipment_id=kwargs.get("equipment_id"),
            expires_at=kwargs.get("expires_at")
        )
        
        return notification
    
    def create_role_based_notification(self, user_role: str, notification_type: str, **kwargs) -> List[Notification]:
        """Create notifications based on user role"""
        notifications = []
        
        # Define role-specific notification preferences
        role_preferences = {
            "trainer": ["equipment_alert", "maintenance_due", "safety_alert", "achievement_unlocked"],
            "lab_manager": ["equipment_alert", "maintenance_due", "safety_alert", "ai_insight", "system_update"],
            "policymaker": ["safety_alert", "ai_insight", "system_update"],
            "admin": ["equipment_alert", "maintenance_due", "safety_alert", "ai_insight", "system_update"],
            "student": ["equipment_alert", "safety_alert", "achievement_unlocked"]
        }
        
        if notification_type in role_preferences.get(user_role, []):
            # In a real implementation, you would get actual user IDs for this role
            # For demo purposes, we'll create a sample notification
            notification = self.create_notification(notification_type, kwargs.get("user_id", 1), **kwargs)
            notifications.append(notification)
        
        return notifications
    
    def schedule_recurring_notifications(self, user_id: int, notification_type: str, 
                                      interval_hours: int, **kwargs) -> List[Notification]:
        """Schedule recurring notifications"""
        notifications = []
        current_time = datetime.now()
        
        # Create notifications for the next 7 days
        for i in range(7):
            notification_time = current_time + timedelta(hours=i * interval_hours)
            
            notification = self.create_notification(
                notification_type, 
                user_id, 
                expires_at=(notification_time + timedelta(hours=24)).isoformat(),
                **kwargs
            )
            notification.timestamp = notification_time.isoformat()
            notifications.append(notification)
        
        return notifications

# Global instances
ai_chatbot = AIChatbot()
notification_engine = NotificationEngine()
