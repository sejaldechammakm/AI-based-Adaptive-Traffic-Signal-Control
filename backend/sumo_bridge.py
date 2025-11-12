import traci
import sumolib
import numpy as np
from typing import Dict, List, Tuple, Optional
import xml.etree.ElementTree as ET

class SUMOBridge:
    def __init__(self, config_file: str):
        self.config_file = config_file
        self.intersection_id = "TL"
        self.lanes = ["E2TL_0", "E2TL_1", "E2TL_2", "E2TL_3"]  # N, E, S, W
        
    def start_simulation(self, gui: bool = False):
        """Start SUMO simulation"""
        sumo_binary = "sumo-gui" if gui else "sumo"
        sumo_cmd = [sumo_binary, "-c", self.config_file, "--start"]
        traci.start(sumo_cmd)
    
    def get_vehicle_count(self, lane_id: str) -> int:
        """Get number of vehicles in a lane"""
        try:
            return traci.lane.getLastStepVehicleNumber(lane_id)
        except:
            return 0
    
    def get_waiting_time(self, lane_id: str) -> float:
        """Get total waiting time for vehicles in a lane"""
        try:
            return traci.lane.getWaitingTime(lane_id)
        except:
            return 0.0
    
    def get_traffic_light_state(self) -> str:
        """Get current traffic light phase"""
        try:
            return traci.trafficlight.getRedYellowGreenState(self.intersection_id)
        except:
            return "rrrr"
    
    def set_traffic_light_phase(self, phase: int):
        """Set traffic light phase"""
        try:
            traci.trafficlight.setPhase(self.intersection_id, phase)
        except:
            pass
    
    def get_intersection_state(self) -> Dict:
        """Get complete intersection state"""
        state = {
            'vehicle_counts': {},
            'waiting_times': {},
            'current_phase': self.get_traffic_light_state(),
            'simulation_time': self.get_simulation_time()
        }
        
        for i, lane in enumerate(self.lanes):
            direction = ['north', 'east', 'south', 'west'][i]
            state['vehicle_counts'][direction] = self.get_vehicle_count(lane)
            state['waiting_times'][direction] = self.get_waiting_time(lane)
        
        return state
    
    def get_simulation_time(self) -> float:
        """Get current simulation time"""
        try:
            return traci.simulation.getTime()
        except:
            return 0.0
    
    def simulation_step(self):
        """Advance simulation by one step"""
        try:
            traci.simulationStep()
        except:
            pass
    
    def close_simulation(self):
        """Close SUMO simulation"""
        try:
            traci.close()
        except:
            pass
    
    def is_simulation_running(self) -> bool:
        """Check if simulation is still running"""
        try:
            return traci.simulation.getMinExpectedNumber() > 0
        except:
            return False

class TrafficDataProcessor:
    """Process and normalize traffic data for RL agent"""
    
    @staticmethod
    def normalize_state(state: Dict) -> np.ndarray:
        """Convert traffic state to normalized feature vector"""
        # Extract vehicle counts
        north_count = state['vehicle_counts'].get('north', 0)
        south_count = state['vehicle_counts'].get('south', 0)
        east_count = state['vehicle_counts'].get('east', 0)
        west_count = state['vehicle_counts'].get('west', 0)
        
        # Encode current phase (simplified)
        phase_state = state['current_phase']
        phase_encoding = 0
        if 'g' in phase_state[:2]:  # North-South green
            phase_encoding = 1
        elif 'g' in phase_state[2:4]:  # East-West green
            phase_encoding = 2
        
        # Normalize counts (assuming max 20 vehicles per lane)
        max_vehicles = 20
        normalized = np.array([
            min(north_count, max_vehicles) / max_vehicles,
            min(south_count, max_vehicles) / max_vehicles,
            min(east_count, max_vehicles) / max_vehicles,
            min(west_count, max_vehicles) / max_vehicles,
            phase_encoding / 2  # Normalize phase encoding
        ])
        
        return normalized
    
    @staticmethod
    def calculate_reward(prev_state: Dict, current_state: Dict, action: int) -> float:
        """Calculate reward for the RL agent"""
        # Calculate total waiting time reduction
        prev_wait = sum(prev_state['waiting_times'].values())
        current_wait = sum(current_state['waiting_times'].values())
        wait_reduction = prev_wait - current_wait
        
        # Calculate throughput (vehicles that passed)
        prev_total = sum(prev_state['vehicle_counts'].values())
        current_total = sum(current_state['vehicle_counts'].values())
        throughput = max(0, prev_total - current_total)
        
        # Balance reward components
        reward = wait_reduction * 0.1 + throughput * 0.5
        
        # Penalty for high queue lengths
        max_queue = max(current_state['vehicle_counts'].values())
        if max_queue > 15:
            reward -= (max_queue - 15) * 0.2
        
        return reward
