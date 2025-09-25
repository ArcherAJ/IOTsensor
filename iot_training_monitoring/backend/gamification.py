# Gamification Engine for IoT Training Equipment Monitoring
from typing import List, Dict, Any, Optional
from models import User, Badge, GamificationStats, UserRole
from datetime import datetime, timedelta
import random

class GamificationEngine:
    def __init__(self):
        self.badges = self._load_badges()
        self.challenges = self._load_challenges()
        self.user_stats = {}  # In-memory storage for demo
        
    def _load_badges(self) -> List[Badge]:
        """Load available badges"""
        return [
            Badge(
                id=1, 
                name="Safety First", 
                description="Completed 100 hours of safe equipment usage", 
                icon="🛡️", 
                points_required=100, 
                category="safety", 
                criteria={"safe_usage_hours": 100}, 
                rarity="common"
            ),
            Badge(
                id=2, 
                name="Efficiency Expert", 
                description="Achieved 90%+ efficiency for 50 hours", 
                icon="⚡", 
                points_required=200, 
                category="efficiency", 
                criteria={"efficiency_score": 0.9, "usage_hours": 50}, 
                rarity="rare"
            ),
            Badge(
                id=3, 
                name="Maintenance Hero", 
                description="Resolved 10 maintenance alerts", 
                icon="🔧", 
                points_required=150, 
                category="maintenance", 
                criteria={"maintenance_resolved": 10}, 
                rarity="common"
            ),
            Badge(
                id=4, 
                name="Innovation Leader", 
                description="Submitted 5 accepted feature requests", 
                icon="💡", 
                points_required=300, 
                category="community", 
                criteria={"feature_requests_accepted": 5}, 
                rarity="epic"
            ),
            Badge(
                id=5, 
                name="Virtual Explorer", 
                description="Completed 5 virtual lab scenarios",
                icon="🌐", 
                points_required=100, 
                category="training", 
                criteria={"virtual_lab_completions": 5}, 
                rarity="common"
            ),
            Badge(
                id=6, 
                name="Energy Saver", 
                description="Reduced energy consumption by 20%",
                icon="🌱", 
                points_required=250, 
                category="sustainability", 
                criteria={"energy_reduction": 0.2}, 
                rarity="rare"
            ),
            Badge(
                id=7, 
                name="Team Player", 
                description="Collaborated on 10 projects",
                icon="👥", 
                points_required=180, 
                category="collaboration", 
                criteria={"collaborations": 10}, 
                rarity="common"
            ),
            Badge(
                id=8, 
                name="Problem Solver", 
                description="Solved 25 technical issues",
                icon="🧩", 
                points_required=400, 
                category="problem_solving", 
                criteria={"issues_solved": 25}, 
                rarity="epic"
            )
        ]

    def _load_challenges(self) -> Dict[UserRole, List[Dict[str, Any]]]:
        """Load role-specific challenges"""
        return {
            UserRole.TRAINER: [
                {
                    "id": 1,
                    "name": "Monitor 10 Students",
                    "description": "Successfully monitor 10 students during training sessions",
                    "points": 50,
                    "criteria": {"students_monitored": 10},
                    "category": "training"
                },
                {
                    "id": 2,
                    "name": "Conduct 5 Safety Briefings",
                    "description": "Conduct 5 comprehensive safety briefings",
                    "points": 75,
                    "criteria": {"safety_briefings": 5},
                    "category": "safety"
                },
                {
                    "id": 3,
                    "name": "Training Excellence",
                    "description": "Complete 20 training sessions this month",
                    "points": 100,
                    "criteria": {"training_sessions": 20},
                    "category": "training"
                }
            ],
            UserRole.LAB_MANAGER: [
                {
                    "id": 4,
                    "name": "Optimize Energy for 3 Equipment Units",
                    "description": "Optimize energy consumption for 3 different equipment units",
                    "points": 100,
                    "criteria": {"energy_optimized_equipment": 3},
                    "category": "efficiency"
                },
                {
                    "id": 5,
                    "name": "Ensure 100% Compliance for a Month",
                    "description": "Maintain 100% compliance rate for an entire month",
                    "points": 200,
                    "criteria": {"monthly_compliance": 1.0},
                    "category": "compliance"
                },
                {
                    "id": 6,
                    "name": "Equipment Uptime Champion",
                    "description": "Maintain 95%+ uptime for all equipment",
                    "points": 150,
                    "criteria": {"uptime_percentage": 0.95},
                    "category": "reliability"
                }
            ],
            UserRole.POLICYMAKER: [
                {
                    "id": 7,
                    "name": "Review 3 Compliance Reports",
                    "description": "Review and approve 3 compliance reports",
                    "points": 100,
                    "criteria": {"reports_reviewed": 3},
                    "category": "compliance"
                },
                {
                    "id": 8,
                    "name": "Propose 1 New Safety Policy",
                    "description": "Propose and get approval for 1 new safety policy",
                    "points": 150,
                    "criteria": {"new_policy_proposed": 1},
                    "category": "policy"
                },
                {
                    "id": 9,
                    "name": "Strategic Planning",
                    "description": "Complete strategic planning for next quarter",
                    "points": 200,
                    "criteria": {"strategic_plan_completed": 1},
                    "category": "planning"
                }
            ],
            UserRole.STUDENT: [
                {
                    "id": 10,
                    "name": "Complete 3 Training Modules",
                    "description": "Complete 3 different training modules",
                    "points": 30,
                    "criteria": {"training_modules_completed": 3},
                    "category": "learning"
                },
                {
                    "id": 11,
                    "name": "Achieve 80% Efficiency on Equipment",
                    "description": "Achieve 80% efficiency on any equipment",
                    "points": 40,
                    "criteria": {"equipment_efficiency_80": 1},
                    "category": "performance"
                },
                {
                    "id": 12,
                    "name": "Safety Advocate",
                    "description": "Report 5 safety improvements",
                    "points": 50,
                    "criteria": {"safety_reports": 5},
                    "category": "safety"
                }
            ],
            UserRole.ADMIN: [
                {
                    "id": 13,
                    "name": "System Optimization",
                    "description": "Optimize system performance by 15%",
                    "points": 300,
                    "criteria": {"system_optimization": 0.15},
                    "category": "system"
                },
                {
                    "id": 14,
                    "name": "User Management Excellence",
                    "description": "Manage 50+ users effectively",
                    "points": 200,
                    "criteria": {"users_managed": 50},
                    "category": "management"
                }
            ]
        }

    def calculate_level(self, points: int) -> int:
        """Calculate user level based on points"""
        if points < 100:
            return 1
        elif points < 300:
            return 2
        elif points < 600:
            return 3
        elif points < 1000:
            return 4
        elif points < 1500:
            return 5
        else:
            return 5 + (points - 1500) // 500  # Level up every 500 points after level 5

    def calculate_streak_days(self, user: User) -> int:
        """Calculate user's current streak"""
        # Simulate streak calculation
        return random.randint(1, 30)

    def generate_leaderboard(self, users: List[User]) -> List[Dict[str, Any]]:
        """Generate leaderboard from user list"""
        leaderboard = []
        
        for user in users:
            # Get user stats or create default
            stats = self.user_stats.get(user.id, {
                "total_points": user.badge_points or 0,
                "badges_earned": len(user.achievements or []),
                "level": self.calculate_level(user.badge_points or 0),
                "streak_days": self.calculate_streak_days(user)
            })
            
            leaderboard.append({
                "user_id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "username": user.username,
                "role": user.role.value,
                "total_points": stats["total_points"],
                "level": stats["level"],
                "badges_earned": stats["badges_earned"],
                "streak_days": stats["streak_days"]
            })
        
        return sorted(leaderboard, key=lambda x: x["total_points"], reverse=True)

    def get_user_stats(self, user_id: int) -> Dict[str, Any]:
        """Get comprehensive user statistics"""
        if user_id not in self.user_stats:
            # Generate default stats
            self.user_stats[user_id] = {
                "total_points": random.randint(100, 2000),
                "level": random.randint(1, 8),
                "badges_earned": random.randint(2, 8),
                "streak_days": random.randint(1, 30),
                "challenges_completed": random.randint(5, 20),
                "equipment_hours": random.randint(50, 500),
                "safety_score": random.uniform(0.8, 1.0),
                "efficiency_score": random.uniform(0.7, 0.95),
                "last_activity": datetime.now().isoformat()
            }
        
        return self.user_stats[user_id]

    def get_role_specific_challenges(self, role: UserRole) -> List[Dict[str, Any]]:
        """Get challenges specific to user role"""
        challenges = self.challenges.get(role, [])
        
        # Add progress to each challenge
        for challenge in challenges:
            challenge["progress"] = random.randint(0, challenge["criteria"].get(list(challenge["criteria"].keys())[0], 10))
            challenge["completed"] = challenge["progress"] >= challenge["criteria"].get(list(challenge["criteria"].keys())[0], 10)
        
        return challenges

    def award_badge(self, user_id: int, badge_id: int) -> bool:
        """Award a badge to a user"""
        badge = next((b for b in self.badges if b.id == badge_id), None)
        if not badge:
            return False
        
        # Add points to user
        if user_id not in self.user_stats:
            self.user_stats[user_id] = {"total_points": 0}
        
        self.user_stats[user_id]["total_points"] += badge.points_required
        
        return True

    def complete_challenge(self, user_id: int, challenge_id: int) -> Dict[str, Any]:
        """Complete a challenge and award points"""
        # Find challenge in all roles
        challenge = None
        for role_challenges in self.challenges.values():
            challenge = next((c for c in role_challenges if c["id"] == challenge_id), None)
            if challenge:
                break
        
        if not challenge:
            return {"success": False, "message": "Challenge not found"}
        
        # Award points
        if user_id not in self.user_stats:
            self.user_stats[user_id] = {"total_points": 0}
        
        self.user_stats[user_id]["total_points"] += challenge["points"]
        
        return {
            "success": True,
            "points_awarded": challenge["points"],
            "challenge_name": challenge["name"],
            "new_total": self.user_stats[user_id]["total_points"]
        }

    def get_available_badges(self, user_id: int) -> List[Dict[str, Any]]:
        """Get badges available to a user"""
        user_stats = self.get_user_stats(user_id)
        
        available_badges = []
        for badge in self.badges:
            # Check if user meets criteria
            meets_criteria = True
            for criterion, required_value in badge.criteria.items():
                user_value = user_stats.get(criterion, 0)
                if user_value < required_value:
                    meets_criteria = False
                    break
            
            badge_dict = badge.dict()
            badge_dict["earned"] = meets_criteria
            badge_dict["progress"] = min(1.0, user_stats.get(list(badge.criteria.keys())[0], 0) / list(badge.criteria.values())[0])
            
            available_badges.append(badge_dict)
        
        return available_badges

    def get_user_achievements(self, user_id: int) -> List[Dict[str, Any]]:
        """Get user's earned achievements"""
        user_stats = self.get_user_stats(user_id)
        achievements = []
        
        # Add recent achievements
        achievement_types = [
            {"name": "First Steps", "description": "Completed first training session", "points": 10},
            {"name": "Safety Conscious", "description": "Maintained safety score above 90%", "points": 25},
            {"name": "Efficiency Expert", "description": "Achieved 85% efficiency rating", "points": 50},
            {"name": "Team Player", "description": "Collaborated on 5 projects", "points": 75},
            {"name": "Problem Solver", "description": "Resolved 10 technical issues", "points": 100}
        ]
        
        for i, achievement in enumerate(achievement_types):
            if user_stats["total_points"] >= achievement["points"]:
                achievements.append({
                    "id": i + 1,
                    "name": achievement["name"],
                    "description": achievement["description"],
                    "points": achievement["points"],
                    "earned_date": (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat(),
                    "icon": "🏆"
                })
        
        return achievements

# Create global instance
gamification_engine = GamificationEngine()