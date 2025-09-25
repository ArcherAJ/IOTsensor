# Virtual Lab Engine for 3D Training Environments
from typing import List, Dict, Any, Optional
from models import VirtualLabEnvironment
from datetime import datetime
import random

class VirtualLabEngine:
    def __init__(self):
        self.environments: List[VirtualLabEnvironment] = self._load_environments()
        self.active_sessions = {}
        self.equipment_interactions = {}
        
    def _load_environments(self) -> List[VirtualLabEnvironment]:
        """Load virtual lab environments"""
        return [
            VirtualLabEnvironment(
                id=1,
                name="Manufacturing Training Lab",
                description="An immersive 3D environment for training on manufacturing equipment including CNC machines, robotic arms, and quality control systems.",
                equipment_models=[
                    {
                        "id": 101, 
                        "name": "CNC Machine", 
                        "type": "CNC Milling",
                        "model_path": "/static/models/cnc_machine.glb", 
                        "position": {"x": 0, "y": 0, "z": 0}, 
                        "scale": 1.0, 
                        "interactive": True, 
                        "status": "active",
                        "location": "Manufacturing Lab A"
                    },
                    {
                        "id": 102, 
                        "name": "Robotic Arm", 
                        "type": "Industrial Robot",
                        "model_path": "/static/models/robotic_arm.glb", 
                        "position": {"x": 5, "y": 0, "z": 2}, 
                        "scale": 1.0, 
                        "interactive": True, 
                        "status": "idle",
                        "location": "Manufacturing Lab A"
                    },
                    {
                        "id": 103, 
                        "name": "3D Printer", 
                        "type": "Additive Manufacturing",
                        "model_path": "/static/models/3d_printer.glb", 
                        "position": {"x": -5, "y": 0, "z": -2}, 
                        "scale": 1.0, 
                        "interactive": False, 
                        "status": "offline",
                        "location": "Manufacturing Lab A"
                    },
                    {
                        "id": 104, 
                        "name": "Quality Control Station", 
                        "type": "Inspection Equipment",
                        "model_path": "/static/models/qc_station.glb", 
                        "position": {"x": 3, "y": 0, "z": -3}, 
                        "scale": 1.0, 
                        "interactive": True, 
                        "status": "active",
                        "location": "Manufacturing Lab A"
                    }
                ],
                environment_settings={
                    "background": "#cccccc", 
                    "lighting": "default",
                    "ambient_light": 0.6,
                    "directional_light": 0.8
                },
                interactive_elements=[
                    {
                        "type": "button", 
                        "label": "Start CNC", 
                        "action": "start_cnc", 
                        "equipment_id": 101,
                        "position": {"x": 0, "y": 2, "z": 0}
                    },
                    {
                        "type": "button", 
                        "label": "Stop Robotic Arm", 
                        "action": "stop_robot", 
                        "equipment_id": 102,
                        "position": {"x": 5, "y": 2, "z": 2}
                    },
                    {
                        "type": "slider", 
                        "label": "Speed Control", 
                        "action": "set_speed", 
                        "equipment_id": 101,
                        "min": 0, 
                        "max": 100,
                        "position": {"x": 1, "y": 1, "z": 0}
                    }
                ],
                learning_objectives=[
                    "Operate CNC machine safely and efficiently",
                    "Program robotic arm for assembly tasks",
                    "Perform quality control inspections",
                    "Understand manufacturing workflow"
                ],
                difficulty_level="intermediate",
                estimated_duration=60,
                prerequisites=["Basic mechanical knowledge", "Safety training completion"],
                created_by=1,
                created_at=datetime.now().isoformat(),
                updated_at=datetime.now().isoformat(),
                is_published=True
            ),
            VirtualLabEnvironment(
                id=2,
                name="Automotive Diagnostics Lab",
                description="Virtual lab for vehicle diagnostics and repair training with engine systems, electrical components, and diagnostic tools.",
                equipment_models=[
                    {
                        "id": 201, 
                        "name": "Car Engine", 
                        "type": "Internal Combustion Engine",
                        "model_path": "/static/models/car_engine.glb", 
                        "position": {"x": 0, "y": 0, "z": 0}, 
                        "scale": 1.0, 
                        "interactive": True, 
                        "status": "active",
                        "location": "Automotive Lab B"
                    },
                    {
                        "id": 202, 
                        "name": "Diagnostic Tool", 
                        "type": "OBD Scanner",
                        "model_path": "/static/models/diagnostic_tool.glb", 
                        "position": {"x": 2, "y": 0, "z": 2}, 
                        "scale": 1.0, 
                        "interactive": True, 
                        "status": "idle",
                        "location": "Automotive Lab B"
                    },
                    {
                        "id": 203, 
                        "name": "Battery Tester", 
                        "type": "Electrical Testing",
                        "model_path": "/static/models/battery_tester.glb", 
                        "position": {"x": -2, "y": 0, "z": 1}, 
                        "scale": 1.0, 
                        "interactive": True, 
                        "status": "active",
                        "location": "Automotive Lab B"
                    }
                ],
                environment_settings={
                    "background": "#eeeeee", 
                    "lighting": "studio",
                    "ambient_light": 0.7,
                    "directional_light": 0.9
                },
                interactive_elements=[
                    {
                        "type": "button", 
                        "label": "Run Diagnostics", 
                        "action": "run_diagnostics", 
                        "equipment_id": 201,
                        "position": {"x": 0, "y": 1, "z": 0}
                    },
                    {
                        "type": "slider", 
                        "label": "Throttle Position", 
                        "action": "set_throttle", 
                        "equipment_id": 201, 
                        "min": 0, 
                        "max": 100,
                        "position": {"x": 1, "y": 1, "z": 0}
                    },
                    {
                        "type": "button", 
                        "label": "Test Battery", 
                        "action": "test_battery", 
                        "equipment_id": 203,
                        "position": {"x": -2, "y": 1, "z": 1}
                    }
                ],
                learning_objectives=[
                    "Identify engine faults and diagnostic codes",
                    "Interpret diagnostic tool readings",
                    "Perform electrical system testing",
                    "Understand automotive repair procedures"
                ],
                difficulty_level="advanced",
                estimated_duration=90,
                prerequisites=["Automotive basics", "Electrical systems knowledge"],
                created_by=1,
                created_at=datetime.now().isoformat(),
                updated_at=datetime.now().isoformat(),
                is_published=True
            ),
            VirtualLabEnvironment(
                id=3,
                name="Renewable Energy Lab",
                description="Virtual environment for training on solar panels, wind turbines, and energy storage systems.",
                equipment_models=[
                    {
                        "id": 301, 
                        "name": "Solar Panel Array", 
                        "type": "Photovoltaic System",
                        "model_path": "/static/models/solar_panel.glb", 
                        "position": {"x": 0, "y": 0, "z": 0}, 
                        "scale": 1.0, 
                        "interactive": True, 
                        "status": "active",
                        "location": "Renewable Energy Lab C"
                    },
                    {
                        "id": 302, 
                        "name": "Wind Turbine", 
                        "type": "Wind Power Generator",
                        "model_path": "/static/models/wind_turbine.glb", 
                        "position": {"x": 10, "y": 0, "z": 0}, 
                        "scale": 1.0, 
                        "interactive": True, 
                        "status": "active",
                        "location": "Renewable Energy Lab C"
                    },
                    {
                        "id": 303, 
                        "name": "Battery Storage", 
                        "type": "Energy Storage System",
                        "model_path": "/static/models/battery_storage.glb", 
                        "position": {"x": -5, "y": 0, "z": 0}, 
                        "scale": 1.0, 
                        "interactive": True, 
                        "status": "idle",
                        "location": "Renewable Energy Lab C"
                    }
                ],
                environment_settings={
                    "background": "#87CEEB", 
                    "lighting": "outdoor",
                    "ambient_light": 0.8,
                    "directional_light": 1.0
                },
                interactive_elements=[
                    {
                        "type": "button", 
                        "label": "Monitor Solar Output", 
                        "action": "monitor_solar", 
                        "equipment_id": 301,
                        "position": {"x": 0, "y": 2, "z": 0}
                    },
                    {
                        "type": "slider", 
                        "label": "Wind Speed", 
                        "action": "set_wind_speed", 
                        "equipment_id": 302, 
                        "min": 0, 
                        "max": 25,
                        "position": {"x": 10, "y": 2, "z": 0}
                    },
                    {
                        "type": "button", 
                        "label": "Charge Battery", 
                        "action": "charge_battery", 
                        "equipment_id": 303,
                        "position": {"x": -5, "y": 2, "z": 0}
                    }
                ],
                learning_objectives=[
                    "Understand renewable energy generation",
                    "Monitor energy production and consumption",
                    "Operate energy storage systems",
                    "Analyze renewable energy efficiency"
                ],
                difficulty_level="intermediate",
                estimated_duration=75,
                prerequisites=["Basic electrical knowledge", "Environmental awareness"],
                created_by=1,
                created_at=datetime.now().isoformat(),
                updated_at=datetime.now().isoformat(),
                is_published=True
            )
        ]

    def get_environment_by_id(self, environment_id: int) -> Optional[VirtualLabEnvironment]:
        """Get environment by ID"""
        for env in self.environments:
            if env.id == environment_id:
                return env
        return None

    def get_all_environments(self) -> List[VirtualLabEnvironment]:
        """Get all available environments"""
        return self.environments

    def create_interactive_scenario(self, environment_id: int, scenario_type: str) -> Dict[str, Any]:
        """Create an interactive training scenario"""
        environment = self.get_environment_by_id(environment_id)
        if not environment:
            return {"error": "Environment not found"}
        
        scenario_id = random.randint(1000, 9999)
        
        # Define scenario based on type
        scenarios = {
            "troubleshooting": {
                "name": "Equipment Troubleshooting",
                "description": f"Diagnose and resolve issues in {environment.name}",
                "tasks": [
                    {"id": 1, "description": "Identify faulty component", "status": "pending", "points": 25},
                    {"id": 2, "description": "Perform diagnostic tests", "status": "pending", "points": 30},
                    {"id": 3, "description": "Implement solution", "status": "pending", "points": 45}
                ],
                "difficulty": "intermediate",
                "estimated_time": 30
            },
            "maintenance": {
                "name": "Preventive Maintenance",
                "description": f"Perform scheduled maintenance on {environment.name} equipment",
                "tasks": [
                    {"id": 1, "description": "Inspect equipment condition", "status": "pending", "points": 20},
                    {"id": 2, "description": "Clean and lubricate components", "status": "pending", "points": 25},
                    {"id": 3, "description": "Test equipment functionality", "status": "pending", "points": 30},
                    {"id": 4, "description": "Update maintenance records", "status": "pending", "points": 25}
                ],
                "difficulty": "beginner",
                "estimated_time": 45
            },
            "safety": {
                "name": "Safety Training",
                "description": f"Learn safety protocols for {environment.name}",
                "tasks": [
                    {"id": 1, "description": "Review safety procedures", "status": "pending", "points": 15},
                    {"id": 2, "description": "Identify potential hazards", "status": "pending", "points": 20},
                    {"id": 3, "description": "Practice emergency procedures", "status": "pending", "points": 25},
                    {"id": 4, "description": "Complete safety checklist", "status": "pending", "points": 20}
                ],
                "difficulty": "beginner",
                "estimated_time": 20
            }
        }
        
        scenario_data = scenarios.get(scenario_type, scenarios["troubleshooting"])
        
        scenario = {
            "scenario_id": scenario_id,
            "environment_id": environment_id,
            "scenario_type": scenario_type,
            "name": scenario_data["name"],
            "description": scenario_data["description"],
            "tasks": scenario_data["tasks"],
            "current_step": 1,
            "status": "active",
            "difficulty": scenario_data["difficulty"],
            "estimated_time": scenario_data["estimated_time"],
            "start_time": datetime.now().isoformat(),
            "progress": 0,
            "total_points": sum(task["points"] for task in scenario_data["tasks"])
        }
        
        # Store active session
        self.active_sessions[scenario_id] = scenario
        
        return scenario

    def simulate_equipment_interaction(self, equipment_id: int, interaction_type: str, user_input: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate equipment interaction and return result"""
        
        # Generate realistic interaction results
        result = {
            "equipment_id": equipment_id,
            "interaction_type": interaction_type,
            "user_input": user_input,
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "response_data": {}
        }
        
        # Equipment-specific interactions
        if interaction_type == "start":
            result["response_data"] = {
                "message": f"Equipment {equipment_id} started successfully",
                "new_status": "active",
                "power_consumption": random.uniform(1000, 3000),
                "efficiency": random.uniform(0.8, 0.95)
            }
        elif interaction_type == "stop":
            result["response_data"] = {
                "message": f"Equipment {equipment_id} stopped safely",
                "new_status": "idle",
                "power_consumption": random.uniform(50, 200),
                "efficiency": 0.0
            }
        elif interaction_type == "inspect":
            result["response_data"] = {
                "message": f"Inspection completed for equipment {equipment_id}",
                "temperature": random.uniform(20, 60),
                "vibration": random.uniform(0.1, 2.0),
                "status": random.choice(["good", "warning", "critical"]),
                "recommendations": [
                    "Equipment operating normally",
                    "Schedule routine maintenance",
                    "Monitor temperature levels"
                ]
            }
        elif interaction_type == "calibrate":
            result["response_data"] = {
                "message": f"Calibration completed for equipment {equipment_id}",
                "accuracy_improvement": random.uniform(0.05, 0.15),
                "new_settings": {
                    "speed": random.uniform(80, 120),
                    "pressure": random.uniform(0.8, 1.2),
                    "temperature": random.uniform(40, 80)
                }
            }
        else:
            result["response_data"] = {
                "message": f"Interaction '{interaction_type}' completed",
                "status": "completed",
                "data": user_input
            }
        
        # Store interaction history
        if equipment_id not in self.equipment_interactions:
            self.equipment_interactions[equipment_id] = []
        
        self.equipment_interactions[equipment_id].append({
            "timestamp": datetime.now().isoformat(),
            "interaction_type": interaction_type,
            "user_input": user_input,
            "result": result["response_data"]
        })
        
        return result

    def get_environment_statistics(self, environment_id: int) -> Dict[str, Any]:
        """Get statistics for a virtual environment"""
        environment = self.get_environment_by_id(environment_id)
        if not environment:
            return {"error": "Environment not found"}
        
        # Generate realistic statistics
        stats = {
            "environment_id": environment_id,
            "environment_name": environment.name,
            "total_sessions": random.randint(150, 800),
            "active_users": random.randint(5, 25),
            "average_completion_rate": random.uniform(0.75, 0.95),
            "average_session_duration": random.uniform(45, 90),
            "most_common_scenarios": ["troubleshooting", "maintenance", "safety"],
            "equipment_utilization": {
                "cnc_machine": random.uniform(0.7, 0.9),
                "robotic_arm": random.uniform(0.6, 0.8),
                "quality_control": random.uniform(0.5, 0.7)
            },
            "user_satisfaction": random.uniform(4.2, 4.8),
            "safety_incidents": random.randint(0, 3),
            "maintenance_alerts": random.randint(2, 8),
            "energy_efficiency": random.uniform(0.8, 0.95),
            "last_updated": datetime.now().isoformat()
        }
        
        return stats

    def get_equipment_interaction_history(self, equipment_id: int) -> List[Dict[str, Any]]:
        """Get interaction history for specific equipment"""
        return self.equipment_interactions.get(equipment_id, [])

    def get_active_sessions(self) -> List[Dict[str, Any]]:
        """Get all active training sessions"""
        return list(self.active_sessions.values())

    def complete_scenario_task(self, scenario_id: int, task_id: int) -> Dict[str, Any]:
        """Complete a task in an active scenario"""
        if scenario_id not in self.active_sessions:
            return {"error": "Scenario not found"}
        
        scenario = self.active_sessions[scenario_id]
        
        # Find and complete the task
        for task in scenario["tasks"]:
            if task["id"] == task_id and task["status"] == "pending":
                task["status"] = "completed"
                task["completed_at"] = datetime.now().isoformat()
                
                # Update scenario progress
                completed_tasks = len([t for t in scenario["tasks"] if t["status"] == "completed"])
                scenario["progress"] = (completed_tasks / len(scenario["tasks"])) * 100
                
                # Check if scenario is complete
                if completed_tasks == len(scenario["tasks"]):
                    scenario["status"] = "completed"
                    scenario["completion_time"] = datetime.now().isoformat()
                
                return {
                    "success": True,
                    "task_completed": task,
                    "scenario_progress": scenario["progress"],
                    "points_earned": task["points"]
                }
        
        return {"error": "Task not found or already completed"}

    def get_scenario_progress(self, scenario_id: int) -> Dict[str, Any]:
        """Get progress for a specific scenario"""
        if scenario_id not in self.active_sessions:
            return {"error": "Scenario not found"}
        
        scenario = self.active_sessions[scenario_id]
        
        return {
            "scenario_id": scenario_id,
            "progress": scenario["progress"],
            "completed_tasks": len([t for t in scenario["tasks"] if t["status"] == "completed"]),
            "total_tasks": len(scenario["tasks"]),
            "status": scenario["status"],
            "points_earned": sum(task["points"] for task in scenario["tasks"] if task["status"] == "completed"),
            "total_points": scenario["total_points"]
        }

# Create global instance
virtual_lab_engine = VirtualLabEngine()