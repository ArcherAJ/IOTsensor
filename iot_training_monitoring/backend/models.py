from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    TRAINER = "trainer"
    LAB_MANAGER = "lab_manager"
    POLICYMAKER = "policymaker"
    ADMIN = "admin"
    STUDENT = "student"

class EquipmentStatus(str, Enum):
    ACTIVE = "active"
    MAINTENANCE = "maintenance"
    OFFLINE = "offline"
    ERROR = "error"
    IDLE = "idle"

class AlertSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class Equipment(BaseModel):
    id: int
    name: str
    type: str
    status: EquipmentStatus
    location: str
    last_maintenance: str
    next_maintenance: str
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    year_installed: Optional[int] = None
    capacity: Optional[str] = None
    power_rating: Optional[str] = None
    maintenance_cost: Optional[float] = None
    warranty_expiry: Optional[str] = None
    health_score: Optional[float] = None
    efficiency_rating: Optional[float] = None
    safety_rating: Optional[float] = None
    usage_hours_total: Optional[float] = None
    last_calibration: Optional[str] = None
    certification_status: Optional[str] = None

class SensorData(BaseModel):
    timestamp: str
    equipment_id: int
    temperature: float
    vibration: float
    power_consumption: float
    usage_hours: float
    humidity: Optional[float] = None
    pressure: Optional[float] = None
    rpm: Optional[float] = None
    efficiency: Optional[float] = None
    oil_level: Optional[float] = None
    noise_level: Optional[float] = None
    voltage: Optional[float] = None
    current: Optional[float] = None
    torque: Optional[float] = None
    speed: Optional[float] = None
    position_x: Optional[float] = None
    position_y: Optional[float] = None
    position_z: Optional[float] = None
    safety_interlock: Optional[bool] = None
    emergency_stop: Optional[bool] = None

class MaintenanceLog(BaseModel):
    id: int
    equipment_id: int
    maintenance_type: str
    description: str
    date: str
    technician: str
    status: str
    cost: Optional[float] = None
    duration_hours: Optional[float] = None
    parts_replaced: Optional[str] = None
    next_due_date: Optional[str] = None
    priority: Optional[str] = None
    maintenance_score: Optional[float] = None
    before_condition: Optional[str] = None
    after_condition: Optional[str] = None
    photos: Optional[List[str]] = None
    notes: Optional[str] = None

class UsageData(BaseModel):
    date: str
    equipment_id: int
    daily_usage_hours: float
    user_count: int
    energy_consumption: float
    cost_per_hour: Optional[float] = None
    maintenance_hours: Optional[float] = None
    downtime_hours: Optional[float] = None
    efficiency_score: Optional[float] = None
    safety_incidents: Optional[int] = None
    skill_level: Optional[str] = None
    training_module: Optional[str] = None
    completion_rate: Optional[float] = None
    user_satisfaction: Optional[float] = None

class Alert(BaseModel):
    id: int
    equipment_id: int
    equipment_name: str
    alert_type: str
    severity: AlertSeverity
    message: str
    timestamp: str
    location: Optional[str] = None
    action_required: Optional[str] = None
    resolved: bool = False
    resolved_by: Optional[str] = None
    resolved_at: Optional[str] = None
    escalation_level: Optional[int] = None
    notification_sent: bool = False

class User(BaseModel):
    id: int
    username: str
    email: str
    role: UserRole
    first_name: str
    last_name: str
    department: Optional[str] = None
    phone: Optional[str] = None
    created_at: str
    last_login: Optional[str] = None
    is_active: bool = True
    permissions: Optional[List[str]] = None
    preferences: Optional[Dict[str, Any]] = None
    badge_points: Optional[int] = 0
    level: Optional[int] = 1
    achievements: Optional[List[str]] = None

class Badge(BaseModel):
    id: int
    name: str
    description: str
    icon: str
    points_required: int
    category: str
    criteria: Dict[str, Any]
    rarity: str = "common"  # common, rare, epic, legendary

class Achievement(BaseModel):
    id: int
    user_id: int
    badge_id: int
    earned_at: str
    progress: Optional[float] = None
    metadata: Optional[Dict[str, Any]] = None

class GamificationStats(BaseModel):
    user_id: int
    total_points: int
    level: int
    badges_earned: int
    streak_days: int
    safe_usage_hours: float
    efficiency_score: float
    maintenance_contributions: int
    safety_reports: int
    training_completions: int

class ChatMessage(BaseModel):
    id: int
    user_id: int
    message: str
    timestamp: str
    is_ai_response: bool
    context: Optional[Dict[str, Any]] = None
    equipment_id: Optional[int] = None
    resolved: bool = False

class Notification(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    priority: AlertSeverity
    timestamp: str
    read: bool = False
    action_url: Optional[str] = None
    equipment_id: Optional[int] = None
    expires_at: Optional[str] = None

class ComplianceReport(BaseModel):
    report_date: str
    total_equipment: int
    compliant_equipment: int
    non_compliant_equipment: int
    safety_violations: int
    maintenance_overdue: int
    certification_expired: int
    compliance_score: float
    standards_met: List[str]
    violations_details: List[Dict[str, Any]]
    recommendations: List[str]
    next_audit_date: str

class SafetyAlert(BaseModel):
    id: int
    equipment_id: int
    equipment_name: str
    alert_type: str
    severity: AlertSeverity
    message: str
    timestamp: str
    location: str
    action_required: str
    resolved: bool = False
    resolved_by: Optional[str] = None
    resolved_at: Optional[str] = None
    safety_score_impact: Optional[float] = None
    training_required: Optional[bool] = None

class PredictiveMaintenance(BaseModel):
    equipment_id: int
    equipment_name: str
    failure_probability: float
    predicted_failure_date: str
    maintenance_recommendation: str
    confidence_score: float
    risk_factors: List[str]
    estimated_cost: float
    urgency_level: AlertSeverity
    maintenance_window: Optional[str] = None
    parts_needed: Optional[List[str]] = None
    technician_skills_required: Optional[List[str]] = None

class AIInsight(BaseModel):
    id: int
    type: str  # trend, anomaly, prediction, recommendation
    title: str
    description: str
    confidence: float
    impact: str  # low, medium, high
    category: str  # efficiency, safety, maintenance, usage
    data_points: List[Dict[str, Any]]
    visualization_data: Optional[Dict[str, Any]] = None
    actionable_items: List[str]
    created_at: str
    expires_at: Optional[str] = None

class OverviewStats(BaseModel):
    total_equipment: int
    active_equipment: int
    maintenance_alerts: int
    uptime_percentage: float
    total_usage_hours: float
    total_energy_consumption: float
    total_cost: float
    safety_incidents: int
    efficiency_average: float
    active_users: int
    training_sessions_today: int
    compliance_score: float
    ai_insights_generated: int
    gamification_engagement: float

class VirtualLabEnvironment(BaseModel):
    id: int
    name: str
    description: str
    equipment_models: List[Dict[str, Any]]
    environment_settings: Dict[str, Any]
    interactive_elements: List[Dict[str, Any]]
    learning_objectives: List[str]
    difficulty_level: str
    estimated_duration: int  # minutes
    prerequisites: List[str]
    created_by: int
    created_at: str
    updated_at: str
    is_published: bool = False
    rating: Optional[float] = None
    completion_count: int = 0

class CommunityFeedback(BaseModel):
    id: int
    user_id: int
    category: str  # bug_report, feature_request, general_feedback
    title: str
    description: str
    priority: AlertSeverity
    status: str  # open, in_progress, resolved, closed
    created_at: str
    updated_at: str
    votes: int = 0
    comments: List[Dict[str, Any]] = []
    assigned_to: Optional[int] = None
    tags: List[str] = []

class TechnologyStack(BaseModel):
    category: str
    name: str
    description: str
    version: str
    purpose: str
    documentation_url: Optional[str] = None
    integration_status: str  # active, planned, deprecated
    performance_metrics: Optional[Dict[str, Any]] = None

class ScalabilityDemo(BaseModel):
    id: int
    name: str
    description: str
    lab_type: str
    equipment_count: int
    user_count: int
    data_points_per_day: int
    performance_metrics: Dict[str, Any]
    cost_analysis: Dict[str, Any]
    implementation_timeline: str
    success_factors: List[str]
    challenges_overcome: List[str]
    lessons_learned: List[str]