import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";
import { TrafficIntersection } from "@/components/traffic-intersection";
import { PerformanceMetrics } from "@/components/performance-metrics";
import { AgentStatus } from "@/components/agent-status";
import { WaitTimeChart } from "@/components/charts/wait-time-chart";
import { LearningProgressChart } from "@/components/charts/learning-progress-chart";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TrafficCone, Pause, RotateCcw, Save, Download, Settings } from "lucide-react";
import { useLocation } from "wouter"; // Import useLocation from wouter

export default function Dashboard() {
  const { toast } = useToast();
  const { simulationData, isConnected, isRunning } = useWebSocket(); // Destructure isRunning here
  
  const { data: simulationStatus } = useQuery({
    queryKey: ["/api/simulation/status"],
    refetchInterval: 5000
  });

  const startSimulation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/simulation/start"),
    onSuccess: () => {
      toast({
        title: "Simulation Started",
        description: "TrafficCone simulation is now running with RL agent"
      });
    },
    onError: () => {
      toast({
        title: "Failed to Start",
        description: "Could not start the traffic simulation",
        variant: "destructive"
      });
    }
  });

  const stopSimulation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/simulation/stop"),
    onSuccess: () => {
      toast({
        title: "Simulation Stopped",
        description: "TrafficCone simulation has been stopped"
      });
    }
  });

  const resetSimulation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/simulation/reset"),
    onSuccess: () => {
      toast({
        title: "Simulation Reset",
        description: "All simulation data has been cleared"
      });
    }
  });

  const saveModel = useMutation({
    mutationFn: () => apiRequest("POST", "/api/simulation/save-model"),
    onSuccess: () => {
      toast({
        title: "Model Saved",
        description: "RL model has been saved successfully."
      });
    },
    onError: () => {
      toast({
        title: "Failed to Save Model",
        description: "Could not save the RL model.",
        variant: "destructive"
      });
    }
  });

  const exportData = useMutation({
    mutationFn: () => apiRequest("POST", "/api/simulation/export-data"),
    onSuccess: () => {
      toast({
        title: "Data Exported",
        description: "Simulation data has been exported successfully."
      });
    },
    onError: () => {
      toast({
        title: "Failed to Export Data",
        description: "Could not export simulation data.",
        variant: "destructive"
      });
    }
  });

  const configureAgent = useMutation({
    mutationFn: () => apiRequest("POST", "/api/simulation/configure-agent"),
    onSuccess: () => {
      toast({
        title: "Agent Configured",
        description: "RL agent configuration has been updated."
      });
    },
    onError: () => {
      toast({
        title: "Failed to Configure Agent",
        description: "Could not update RL agent configuration.",
        variant: "destructive"
      });
    }
  });

  const isSimulationRunningFromApi = (simulationStatus as any)?.isRunning || false; 

  const [location, setLocation] = useLocation(); // Initialize useLocation

  const handleLogout = () => {
    // Clear session storage or local storage
    localStorage.removeItem("isAuthenticated"); // Corrected key
    // Redirect to login page
    setLocation("/login");
    toast({
      title: "Logged Out",
      description: "You have been logged out.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <TrafficCone className="text-primary text-2xl" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Adaptive TrafficCone Control</h1>
                <p className="text-muted-foreground text-sm">AI-Powered Signal Optimization Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* System Status */}
              <div className="flex items-center space-x-2 bg-muted px-3 py-2 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${isConnected && isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium" data-testid="text-agent-status">
                  {isConnected && isRunning ? "RL Agent Active" : "RL Agent Inactive"}
                </span>
              </div>
              
              {/* Simulation Controls */}
              <div className="flex items-center space-x-2">
                {!isRunning ? (
                  <Button 
                    onClick={() => startSimulation.mutate()}
                    disabled={startSimulation.isPending}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    data-testid="button-start-simulation"
                  >
                    <TrafficCone className="mr-2 h-4 w-4" />
                    Start
                  </Button>
                ) : (
                  <Button 
                    onClick={() => stopSimulation.mutate()}
                    disabled={stopSimulation.isPending}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    data-testid="button-pause-simulation"
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </Button>
                )}
                <Button 
                  variant="secondary"
                  onClick={() => resetSimulation.mutate()}
                  disabled={resetSimulation.isPending}
                  data-testid="button-reset-simulation"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
            {/* TrafficCone Intersection Visualization */}
            <div className="xl:col-span-2">
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Live Intersection</h2>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-muted-foreground">
                        Simulation Time: <span className="text-foreground font-mono" data-testid="text-simulation-time">
                          {simulationData ? new Date(simulationData.simulationTime * 1000).toISOString().substr(11, 8) : "00:00:00"}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Cycle: <span className="text-foreground font-mono" data-testid="text-cycle-number">
                          {simulationData?.cycleNumber?.toLocaleString() || "0"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <TrafficIntersection data={simulationData} />
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics Sidebar */}
            <div className="xl:col-span-1">
              <div className="space-y-6">
                {/* Key Performance Metrics */}
                <PerformanceMetrics data={simulationData} />

                {/* RL Agent Status */}
                <AgentStatus data={simulationData} />

                {/* System Controls */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Controls</h2>
                    <div className="space-y-3">
                      <Button 
                        className="w-full" 
                        variant="outline" 
                        data-testid="button-save-model"
                        onClick={() => saveModel.mutate()}
                        disabled={saveModel.isPending}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Model
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="outline" 
                        data-testid="button-export-data"
                        onClick={() => exportData.mutate()}
                        disabled={exportData.isPending}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export Data
                      </Button>
                      <Button 
                        className="w-full bg-yellow-600 text-white hover:bg-yellow-700" 
                        data-testid="button-configure-agent"
                        onClick={() => configureAgent.mutate()}
                        disabled={configureAgent.isPending}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Configure Agent
                      </Button>

                      <Button
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="mt-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <WaitTimeChart />
              <LearningProgressChart />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
