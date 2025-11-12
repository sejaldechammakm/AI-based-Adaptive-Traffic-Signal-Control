from typing import Dict, Any, Optional
from datetime import datetime
import uuid

def _normalize_timestamp(ts: Any) -> datetime:
    if isinstance(ts, datetime):
        return ts
    if isinstance(ts, str):
        try:
            return datetime.fromisoformat(ts)
        except ValueError:
            pass # Fall through to return datetime.min
    return datetime.min

class MemStorage:
    def __init__(self):
        self.traffic_states: Dict[str, Dict] = {}
        self.performance_metrics: Dict[str, Dict] = {}
        self.agent_statuses: Dict[str, Dict] = {}

    async def get_latest_traffic_state(self) -> Optional[Dict]:
        if not self.traffic_states:
            return None
        return max(self.traffic_states.values(), key=lambda x: _normalize_timestamp(x.get("timestamp")))

    async def get_latest_performance_metrics(self) -> Optional[Dict]:
        if not self.performance_metrics:
            return None
        return max(self.performance_metrics.values(), key=lambda x: _normalize_timestamp(x.get("timestamp")))

    async def get_latest_agent_status(self) -> Optional[Dict]:
        if not self.agent_statuses:
            return None
        return max(self.agent_statuses.values(), key=lambda x: _normalize_timestamp(x.get("timestamp")))

    async def get_baseline_comparison(self) -> Dict[str, Any]:
        # Simulate some baseline data as there's no distinction in current storage
        # In a real scenario, baseline metrics would be stored with a flag
        mock_baseline = [
            {"avgWaitTime": 35.0, "throughput": 1000, "maxQueueLength": 10, "efficiencyScore": 70, "timestamp": datetime.now()},
            {"avgWaitTime": 34.5, "throughput": 1020, "maxQueueLength": 9, "efficiencyScore": 72, "timestamp": datetime.now()},
            {"avgWaitTime": 36.0, "throughput": 980, "maxQueueLength": 11, "efficiencyScore": 68, "timestamp": datetime.now()},
        ]
        rl_metrics = sorted(list(self.performance_metrics.values()), key=lambda x: _normalize_timestamp(x.get("timestamp")), reverse=True)[:10]
        return {"rl": rl_metrics, "baseline": mock_baseline}

    async def get_performance_history(self, limit: int = 10) -> list[Dict]:
        # Sort performance metrics by timestamp in descending order and return the latest 'limit' items
        sorted_metrics = sorted(
            list(self.performance_metrics.values()),
            key=lambda x: _normalize_timestamp(x.get("timestamp")),
            reverse=True
        )
        return sorted_metrics[:limit]

    async def insert_traffic_state(self, state_data: Dict) -> Dict:
        new_id = str(uuid.uuid4())
        state = {"id": new_id, "timestamp": datetime.now(), **state_data}
        self.traffic_states[new_id] = state
        return state

    async def insert_performance_metrics(self, metrics_data: Dict) -> Dict:
        new_id = str(uuid.uuid4())
        metrics = {"id": new_id, "timestamp": datetime.now(), **metrics_data}
        self.performance_metrics[new_id] = metrics
        return metrics

    async def insert_agent_status(self, status_data: Dict) -> Dict:
        new_id = str(uuid.uuid4())
        status = {"id": new_id, "timestamp": datetime.now(), **status_data}
        self.agent_statuses[new_id] = status
        return status

storage = MemStorage()
