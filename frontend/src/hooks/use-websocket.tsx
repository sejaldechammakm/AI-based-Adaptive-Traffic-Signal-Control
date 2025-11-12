import { useState, useEffect, useRef } from "react";
import { SimulationData, SimulationDataSchema } from "@shared/schema";
// import { io, Socket } from "socket.io-client"; // Remove socket.io-client

interface UseWebSocketReturn {
  simulationData?: SimulationData;
  isConnected: boolean;
  error?: string;
  isRunning: boolean; // Add isRunning to return type
}

// Define the WebSocket URL for the FastAPI backend
// Assuming FastAPI is running on port 8000
const WEBSOCKET_URL = process.env.NODE_ENV === 'production'
  ? `wss://${window.location.host}/ws`
  : `ws://localhost:8000/ws`;

export function useWebSocket(): UseWebSocketReturn {
  const [simulationData, setSimulationData] = useState<SimulationData>();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string>();
  const [isRunning, setIsRunning] = useState(false); // Add isRunning state
  const wsRef = useRef<WebSocket>(); // Change to WebSocket

  useEffect(() => {
    // Create WebSocket connection
    const ws = new WebSocket(WEBSOCKET_URL);

    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setError(undefined);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setIsRunning(false); // Reset isRunning on disconnect
      // Optionally try to reconnect after a delay
      // setTimeout(() => {
      //   wsRef.current = new WebSocket(WEBSOCKET_URL);
      // }, 3000);
    };

    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      setError('WebSocket connection error');
      setIsConnected(false);
      setIsRunning(false); // Reset isRunning on error
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        // Assuming FastAPI sends { "type": "simulation_update", "data": simulationData }
        if (message.type === 'simulation_update') {
          const validatedData = SimulationDataSchema.parse(message.data);
          setSimulationData(validatedData);
          setIsRunning(message.isRunning); // Update isRunning from message
          setError(undefined);
        } else if (message.type === 'initial_data') {
          // Handle initial data sent upon connection
          const validatedData = SimulationDataSchema.parse(message.data);
          setSimulationData(validatedData);
          setIsConnected(true); // Should always be true when receiving initial data
          setIsRunning(message.isRunning); // Update isRunning from message
          setError(undefined);
        } else if (message.type === 'simulation_stopped') {
          console.log('Simulation stopped');
          setIsRunning(false); // Simulation explicitly stopped
          setError(undefined);
        }
      } catch (parseError) {
        console.error('Failed to parse WebSocket message:', parseError);
        setError('Invalid data format received over WebSocket');
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return {
    simulationData,
    isConnected,
    error,
    isRunning // Return isRunning state
  };
}
