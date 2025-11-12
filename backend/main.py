from fastapi import FastAPI, BackgroundTasks, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, Optional, Set
from datetime import datetime
import asyncio
import subprocess
import os
import sys
# Add the project root to sys.path to resolve absolute imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import json
from backend.storage import storage

app = FastAPI()

# Add CORS middleware
origins = [
    "http://localhost",
    "http://localhost:5173",  # Your frontend's origin
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

simulation_process: Optional[subprocess.Popen] = None
active_websockets: Set[WebSocket] = set()

@app.get("/")
async def root():
    return {"message": "Hello from FastAPI backend!"}

async def broadcast_simulation_update(data: Dict):
    for websocket in list(active_websockets): # Iterate over a copy to avoid modification during iteration
        try:
            await websocket.send_json(data)
        except WebSocketDisconnect:
            active_websockets.remove(websocket)
        except Exception as e:
            print(f"Error broadcasting to websocket: {e}")
            active_websockets.remove(websocket)

async def run_simulation_process():
    global simulation_process
    script_path = os.path.join(os.getcwd(), "backend", "traffic_simulation.py")
    print(f"Attempting to start simulation process: python {script_path}")
    
    try:
        simulation_process = subprocess.Popen(
            ["python", script_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True, # Decode stdout/stderr as text
            bufsize=1, # Line-buffered output
        )

        # Process stdout in a separate task using a thread-based approach
        asyncio.create_task(read_stream_in_thread(simulation_process.stdout, read_stdout_callback))
        asyncio.create_task(read_stream_in_thread(simulation_process.stderr, read_stderr_callback))

        await asyncio.to_thread(simulation_process.wait) # Wait for the process to complete (or be terminated) in a separate thread
        print("Simulation process finished.")
        await broadcast_simulation_update({"type": "simulation_stopped"})
    except Exception as e:
        print(f"Error starting or running simulation process: {e}")
    finally:
        simulation_process = None # Ensure simulation_process is set to None when it finishes

async def read_stream_in_thread(stream, callback):
    loop = asyncio.get_event_loop()
    while True:
        line = await loop.run_in_executor(None, stream.readline) # Read line in a separate thread
        if not line: # EOF
            break
        await callback(line.strip())

async def read_stdout_callback(line: str):
    global storage, simulation_process
    try:
        json_data = json.loads(line)
        # Store data
        await storage.insert_traffic_state(json_data.get("intersection", {}))
        await storage.insert_performance_metrics(json_data.get("performance", {}))
        await storage.insert_agent_status(json_data.get("agent", {}))
        
        # Broadcast data only if parsing and storing were successful
        await broadcast_simulation_update({"type": "simulation_update", 
                                           "data": json_data,
                                           "isRunning": simulation_process is not None and simulation_process.poll() is None})
    except json.JSONDecodeError:
        # It's not JSON, print it to stderr as a non-critical message and ignore
        print(f"Simulation stdout (non-JSON): {line}", file=sys.stderr)
    except Exception as e:
        print(f"Error processing simulation stdout: {e}", file=sys.stderr)

async def read_stderr_callback(line: str):
    print(f"Simulation Error (stderr): {line}")

@app.get("/api/simulation/status")
async def get_simulation_status():
    latest_state = await storage.get_latest_traffic_state()
    latest_metrics = await storage.get_latest_performance_metrics()
    latest_agent = await storage.get_latest_agent_status()

    # Convert datetime objects to ISO format strings for JSON serialization
    if latest_state and "timestamp" in latest_state and isinstance(latest_state["timestamp"], datetime):
        latest_state["timestamp"] = latest_state["timestamp"].isoformat()
    if latest_metrics and "timestamp" in latest_metrics and isinstance(latest_metrics["timestamp"], datetime):
        latest_metrics["timestamp"] = latest_metrics["timestamp"].isoformat()
    if latest_agent and "timestamp" in latest_agent and isinstance(latest_agent["timestamp"], datetime):
        latest_agent["timestamp"] = latest_agent["timestamp"].isoformat()

    return {
        "isRunning": simulation_process is not None and simulation_process.poll() is None,
        "currentState": latest_state,
        "performance": latest_metrics,
        "agent": latest_agent,
    }

@app.post("/api/simulation/start")
async def start_simulation(background_tasks: BackgroundTasks):
    global simulation_process
    if simulation_process and simulation_process.poll() is None:
        raise HTTPException(status_code=400, detail="Simulation already running")

    background_tasks.add_task(run_simulation_process)
    return {"message": "Simulation started successfully"}

@app.post("/api/simulation/stop")
async def stop_simulation():
    global simulation_process
    if not simulation_process or simulation_process.poll() is not None:
        raise HTTPException(status_code=400, detail="No simulation running")

    simulation_process.terminate() # or .kill() for a more forceful stop
    # Give it a moment to terminate gracefully
    await asyncio.sleep(1)
    if simulation_process.poll() is None:
        simulation_process.kill() # Force kill if not terminated
    
    simulation_process = None
    await broadcast_simulation_update({"type": "simulation_stopped", "isRunning": False})
    return {"message": "Simulation stopped successfully"}

@app.post("/api/simulation/reset")
async def reset_simulation():
    global simulation_process
    if simulation_process and simulation_process.poll() is None:
        simulation_process.terminate()
        await asyncio.sleep(1)
        if simulation_process.poll() is None:
            simulation_process.kill()
        simulation_process = None

    # In a real implementation, you might clear storage here if needed
    # For now, we'll just acknowledge the reset.
    await broadcast_simulation_update({"type": "simulation_stopped", "isRunning": False}) # Send isRunning=False on reset
    return {"message": "Simulation reset successfully"}

@app.get("/api/performance/history")
async def get_performance_history(limit: int = 100):
    history = await storage.get_performance_history(limit)
    for item in history:
        # Ensure episode is present, default to 0 if not
        item["episode"] = item.get("episode", 0)
        if "timestamp" in item and isinstance(item["timestamp"], datetime): item["timestamp"] = item["timestamp"].isoformat()
    return history

@app.get("/api/performance/comparison")
async def get_baseline_comparison():
    comparison = await storage.get_baseline_comparison()
    for item in comparison["rl"]:
        if "timestamp" in item and isinstance(item["timestamp"], datetime): item["timestamp"] = item["timestamp"].isoformat()
    for item in comparison["baseline"]:
        if "timestamp" in item and isinstance(item["timestamp"], datetime): item["timestamp"] = item["timestamp"].isoformat()
    return comparison

@app.get("/api/agent/actions")
async def get_agent_actions(limit: int = 10):
    actions = await storage.get_recent_agent_actions(limit)
    for item in actions:
        if "timestamp" in item and isinstance(item["timestamp"], datetime): item["timestamp"] = item["timestamp"].isoformat()
    return actions

@app.post("/api/simulation/save-model")
async def save_model():
    # Placeholder: In a real scenario, you'd signal the simulation process to save its model
    # or implement direct model saving here if the agent state was accessible.
    print("Backend: Received request to save model.")
    return {"message": "Model save initiated (placeholder)"}

@app.post("/api/simulation/export-data")
async def export_data():
    # Placeholder: In a real scenario, you'd fetch data from storage and write to a file.
    print("Backend: Received request to export data.")
    return {"message": "Data export initiated (placeholder)"}

@app.post("/api/simulation/configure-agent")
async def configure_agent():
    # Placeholder: In a real scenario, this would receive agent configuration parameters
    # and apply them to the running simulation/agent instance.
    print("Backend: Received request to configure agent.")
    return {"message": "Agent configuration initiated (placeholder)"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_websockets.add(websocket)
    try:
        # Send initial data to the new client
        latest_state = await storage.get_latest_traffic_state()
        latest_metrics = await storage.get_latest_performance_metrics()
        latest_agent = await storage.get_latest_agent_status()

        # Prepare a default simulation data structure
        current_sim_data = {
            "simulationTime": 0,
            "cycleNumber": 0,
            "intersection": {
                "northQueue": 0,
                "southQueue": 0,
                "eastQueue": 0,
                "westQueue": 0,
                "currentPhase": "NS_GREEN", # Default valid enum value
                "phaseTimeRemaining": 0,
                "vehicles": []
            },
            "performance": {
                "avgWaitTime": 0.0,
                "throughput": 0,
                "maxQueue": 0,
                "efficiencyScore": 0.0
            },
            "agent": {
                "lastAction": "",
                "epsilon": 0.0,
                "episode": 0,
                "replayBufferFull": 0.0,
                "recentActions": []
            },
        }

        # Override with actual latest data if available
        if latest_state:
            current_sim_data["intersection"].update({
                "northQueue": latest_state.get("northQueue", 0),
                "southQueue": latest_state.get("southQueue", 0),
                "eastQueue": latest_state.get("eastQueue", 0),
                "westQueue": latest_state.get("westQueue", 0),
                "currentPhase": latest_state.get("currentPhase", "NS_GREEN"),
                "phaseTimeRemaining": latest_state.get("phaseTimeRemaining", 0),
                "vehicles": latest_state.get("vehicles", []),
            })
            if "simulationTime" in latest_state: current_sim_data["simulationTime"] = latest_state["simulationTime"]
            if "cycleNumber" in latest_state: current_sim_data["cycleNumber"] = latest_state["cycleNumber"]
        
        if latest_metrics:
            current_sim_data["performance"].update({
                "avgWaitTime": latest_metrics.get("avgWaitTime", 0.0),
                "throughput": latest_metrics.get("throughput", 0),
                "maxQueue": latest_metrics.get("maxQueue", 0),
                "efficiencyScore": latest_metrics.get("efficiencyScore", 0.0)
            })
            
        if latest_agent:
            current_sim_data["agent"].update({
                "lastAction": latest_agent.get("lastAction", ""),
                "epsilon": latest_agent.get("epsilon", 0.0),
                "episode": latest_agent.get("episode", 0),
                "replayBufferFull": latest_agent.get("replayBufferFull", 0.0),
                "recentActions": latest_agent.get("recentActions", []),
            })
            
        # Apply timestamp formatting to the initial data (only if they are datetime objects)
        if latest_state and "timestamp" in latest_state and isinstance(latest_state["timestamp"], datetime):
            # We are assigning to the top-level simulationTime/cycleNumber if they were in latest_state
            # so these should only be datetime objects if from latest_state
            current_sim_data["intersection"]["timestamp"] = latest_state["timestamp"].isoformat()
        if latest_metrics and "timestamp" in latest_metrics and isinstance(latest_metrics["timestamp"], datetime):
            current_sim_data["performance"]["timestamp"] = latest_metrics["timestamp"].isoformat()
        if latest_agent and "timestamp" in latest_agent and isinstance(latest_agent["timestamp"], datetime):
            current_sim_data["agent"]["timestamp"] = latest_agent["timestamp"].isoformat()
            
        initial_data = {
            "type": "initial_data",
            "isRunning": simulation_process is not None and simulation_process.poll() is None,
            "data": current_sim_data,
        }

        await websocket.send_json(initial_data)

        while True:
            # Keep the connection alive, listen for messages if needed
            message = await websocket.receive_text() # Or receive_json
            print(f"Received message from client: {message}")
    except WebSocketDisconnect:
        print("Client disconnected from websocket")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        active_websockets.remove(websocket)
