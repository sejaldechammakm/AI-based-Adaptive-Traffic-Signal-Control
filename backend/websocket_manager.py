import asyncio
import json
import logging
from typing import Dict, List, Set
import websockets
from websockets.server import WebSocketServerProtocol

logger = logging.getLogger(__name__)

class WebSocketManager:
    def __init__(self):
        self.connections: Set[WebSocketServerProtocol] = set()
        self.latest_data: Dict = {}
        
    async def register(self, websocket: WebSocketServerProtocol):
        """Register a new WebSocket connection"""
        self.connections.add(websocket)
        logger.info(f"New client connected. Total connections: {len(self.connections)}")
        
        # Send latest data to new connection
        if self.latest_data:
            await self.send_to_client(websocket, self.latest_data)
    
    async def unregister(self, websocket: WebSocketServerProtocol):
        """Unregister a WebSocket connection"""
        self.connections.discard(websocket)
        logger.info(f"Client disconnected. Total connections: {len(self.connections)}")
    
    async def send_to_client(self, websocket: WebSocketServerProtocol, data: Dict):
        """Send data to a specific client"""
        try:
            await websocket.send(json.dumps(data))
        except websockets.exceptions.ConnectionClosed:
            await self.unregister(websocket)
        except Exception as e:
            logger.error(f"Error sending data to client: {e}")
    
    async def broadcast(self, data: Dict):
        """Broadcast data to all connected clients"""
        if not self.connections:
            return
        
        self.latest_data = data
        disconnected = set()
        
        for websocket in self.connections:
            try:
                await websocket.send(json.dumps(data))
            except websockets.exceptions.ConnectionClosed:
                disconnected.add(websocket)
            except Exception as e:
                logger.error(f"Error broadcasting to client: {e}")
                disconnected.add(websocket)
        
        # Clean up disconnected clients
        for websocket in disconnected:
            await self.unregister(websocket)
    
    async def handle_client_message(self, websocket: WebSocketServerProtocol, message: str):
        """Handle incoming message from client"""
        try:
            data = json.loads(message)
            message_type = data.get('type')
            
            if message_type == 'get_status':
                # Send current simulation status
                response = {
                    'type': 'status_response',
                    'data': self.latest_data
                }
                await self.send_to_client(websocket, response)
            
            elif message_type == 'ping':
                # Respond to ping
                response = {'type': 'pong'}
                await self.send_to_client(websocket, response)
                
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received from client: {message}")
        except Exception as e:
            logger.error(f"Error handling client message: {e}")
    
    async def client_handler(self, websocket: WebSocketServerProtocol, path: str):
        """Handle WebSocket client connection"""
        await self.register(websocket)
        
        try:
            async for message in websocket:
                await self.handle_client_message(websocket, message)
        except websockets.exceptions.ConnectionClosed:
            pass
        except Exception as e:
            logger.error(f"Error in client handler: {e}")
        finally:
            await self.unregister(websocket)
    
    def get_connection_count(self) -> int:
        """Get number of active connections"""
        return len(self.connections)

# Global WebSocket manager instance
websocket_manager = WebSocketManager()

async def start_websocket_server(host: str = "localhost", port: int = 8765):
    """Start the WebSocket server"""
    logger.info(f"Starting WebSocket server on {host}:{port}")
    
    server = await websockets.serve(
        websocket_manager.client_handler,
        host,
        port
    )
    
    logger.info("WebSocket server started successfully")
    return server

# Example usage for testing
async def simulate_data_updates():
    """Simulate periodic data updates for testing"""
    import random
    
    while True:
        # Generate mock simulation data
        mock_data = {
            'simulationTime': random.randint(1000, 50000),
            'cycleNumber': random.randint(100, 2000),
            'intersection': {
                'northQueue': random.randint(0, 12),
                'southQueue': random.randint(0, 15),
                'eastQueue': random.randint(0, 8),
                'westQueue': random.randint(0, 10),
                'currentPhase': random.choice(['NS_GREEN', 'EW_GREEN', 'NS_YELLOW', 'EW_YELLOW']),
                'phaseTimeRemaining': random.randint(5, 30),
                'vehicles': []
            },
            'performance': {
                'avgWaitTime': random.uniform(18, 35),
                'throughput': random.randint(1200, 2000),
                'maxQueue': random.randint(8, 15),
                'efficiencyScore': random.uniform(75, 95)
            },
            'agent': {
                'lastAction': random.choice(['EXTEND_NS', 'EXTEND_EW', 'SWITCH_NS', 'SWITCH_EW']),
                'epsilon': random.uniform(0.01, 0.1),
                'episode': random.randint(10000, 20000),
                'replayBufferFull': random.uniform(85, 100),
                'recentActions': [
                    {'time': '14:32:41', 'action': 'EXTEND_EW'},
                    {'time': '14:32:35', 'action': 'SWITCH_NS'},
                    {'time': '14:32:28', 'action': 'EXTEND_NS'}
                ]
            }
        }
        
        await websocket_manager.broadcast(mock_data)
        await asyncio.sleep(2)  # Update every 2 seconds

if __name__ == "__main__":
    # Run WebSocket server with mock data for testing
    async def main():
        server = await start_websocket_server()
        
        # Start mock data simulation
        data_task = asyncio.create_task(simulate_data_updates())
        
        try:
            await server.wait_closed()
        except KeyboardInterrupt:
            logger.info("WebSocket server stopped")
        finally:
            data_task.cancel()
    
    asyncio.run(main())
