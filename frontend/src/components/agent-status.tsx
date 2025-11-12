import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SimulationData } from "@shared/schema";
import { Save, Download, Settings } from "lucide-react";

interface AgentStatusProps {
  data?: SimulationData;
}

export function AgentStatus({ data }: AgentStatusProps) {
  const agent = data?.agent;

  const getActionColor = (action: string) => {
    switch (action) {
      case 'EXTEND_EW':
      case 'EXTEND_NS':
        return 'bg-green-600';
      case 'SWITCH_NS':
      case 'SWITCH_EW':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Agent Status</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Training Episodes</span>
            <span className="font-mono text-foreground" data-testid="text-training-episodes">
              {agent?.episode?.toLocaleString() || "0"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Epsilon</span>
            <span className="font-mono text-foreground" data-testid="text-current-epsilon">
              {agent?.epsilon?.toFixed(3) || "0.000"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Learning Rate</span>
            <span className="font-mono text-foreground" data-testid="text-learning-rate">
              0.001
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Replay Buffer</span>
            <span className="font-mono text-foreground" data-testid="text-replay-buffer">
              {agent?.replayBufferFull?.toFixed(1) || "0.0"}% Full
            </span>
          </div>
        </div>

        {/* Action History */}
        <div className="mt-6">
          <h3 className="font-semibold mb-3">Recent Actions</h3>
          <div className="space-y-2">
            {agent?.recentActions?.map((action, index) => (
              <div key={index} className="flex items-center justify-between text-sm" data-testid={`action-${index}`}>
                <span className="text-muted-foreground">{action.time}</span>
                <span className={`${getActionColor(action.action)} text-white px-2 py-1 rounded text-xs`}>
                  {action.action}
                </span>
              </div>
            )) || (
              <div className="text-sm text-muted-foreground" data-testid="text-no-actions">
                No recent actions available
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
