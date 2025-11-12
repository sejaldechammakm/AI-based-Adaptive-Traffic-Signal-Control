import { Card, CardContent } from "@/components/ui/card";
import { SimulationData } from "@shared/schema";
import { Clock, Car, ListOrdered, Gauge } from "lucide-react";

interface PerformanceMetricsProps {
  data?: SimulationData;
}

export function PerformanceMetrics({ data }: PerformanceMetricsProps) {
  const performance = data?.performance;

  const formatChange = (value: number, isPositive: boolean) => {
    const sign = isPositive ? "+" : "-";
    return `${sign}${Math.abs(value)}%`;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
        <div className="space-y-4">
          {/* Average Wait Time */}
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Avg Wait Time</span>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-green-400" data-testid="text-avg-wait-time">
              {performance?.avgWaitTime?.toFixed(1) || "0.0"}s
            </div>
            <div className="text-sm text-green-400" data-testid="text-wait-time-improvement">
              -32% vs baseline
            </div>
          </div>

          {/* Throughput */}
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Vehicles/Hour</span>
              <Car className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-blue-400" data-testid="text-throughput">
              {performance?.throughput?.toLocaleString() || "0"}
            </div>
            <div className="text-sm text-green-400" data-testid="text-throughput-improvement">
              +28% vs baseline
            </div>
          </div>

          {/* Queue Length */}
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Max Queue</span>
              <ListOrdered className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-yellow-400" data-testid="text-max-queue">
              {performance?.maxQueue || 0}
            </div>
            <div className="text-sm text-green-400" data-testid="text-queue-improvement">
              -15% vs baseline
            </div>
          </div>

          {/* Efficiency Score */}
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Efficiency Score</span>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-green-400" data-testid="text-efficiency-score">
              {performance?.efficiencyScore?.toFixed(1) || "0.0"}%
            </div>
            <div className="text-sm text-green-400" data-testid="text-efficiency-target">
              Target: &gt;85%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
