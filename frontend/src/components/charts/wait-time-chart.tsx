import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

export function WaitTimeChart() {
  const { data: comparisonData } = useQuery({
    queryKey: ["/api/performance/comparison"],
    refetchInterval: 10000
  });

  const rlData = (comparisonData as any)?.rl || [];
  const baselineData = (comparisonData as any)?.baseline || [];

  // Calculate average wait times for display
  const avgRlWaitTime = rlData.length > 0 
    ? rlData.reduce((sum: number, metric: any) => sum + metric.avgWaitTime, 0) / rlData.length 
    : 0;
  
  const avgBaselineWaitTime = baselineData.length > 0
    ? baselineData.reduce((sum: number, metric: any) => sum + metric.avgWaitTime, 0) / baselineData.length
    : 0;

  // Create bar heights as percentages (baseline = 100%, RL relative to that)
  const maxWaitTime = Math.max(avgRlWaitTime, avgBaselineWaitTime, 1);
  const rlBarHeight = (avgRlWaitTime / maxWaitTime) * 100;
  const baselineBarHeight = (avgBaselineWaitTime / maxWaitTime) * 100;

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Wait Time Comparison</h2>
        <div className="relative h-64">
          <div className="absolute inset-0 bg-muted rounded-lg p-4">
            <div className="flex items-end justify-center h-full space-x-8">
              {/* RL Agent bar */}
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-end h-40">
                  <div 
                    className="w-16 bg-green-500 rounded-t transition-all duration-500" 
                    style={{ height: `${Math.max(rlBarHeight, 5)}%` }}
                    title={`RL Agent: ${avgRlWaitTime.toFixed(1)}s`}
                    data-testid="bar-rl-wait-time"
                  ></div>
                </div>
                <div className="text-sm font-medium text-center">
                  <div className="text-green-400" data-testid="text-rl-avg-wait">
                    {avgRlWaitTime.toFixed(1)}s
                  </div>
                  <div className="text-xs text-muted-foreground">RL Agent</div>
                </div>
              </div>
              
              {/* Fixed Timer bar */}
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-end h-40">
                  <div 
                    className="w-16 bg-red-500 rounded-t transition-all duration-500" 
                    style={{ height: `${Math.max(baselineBarHeight, 5)}%` }}
                    title={`Fixed Timer: ${avgBaselineWaitTime.toFixed(1)}s`}
                    data-testid="bar-baseline-wait-time"
                  ></div>
                </div>
                <div className="text-sm font-medium text-center">
                  <div className="text-red-400" data-testid="text-baseline-avg-wait">
                    {avgBaselineWaitTime.toFixed(1)}s
                  </div>
                  <div className="text-xs text-muted-foreground">Fixed Timer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mt-4 space-x-6">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span className="text-sm">RL Agent</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            <span className="text-sm">Fixed Timer</span>
          </div>
        </div>

        {avgRlWaitTime > 0 && avgBaselineWaitTime > 0 && (
          <div className="mt-4 text-center">
            <div className="text-sm text-muted-foreground">
              Improvement: 
              <span className="text-green-400 font-semibold ml-1" data-testid="text-wait-time-percentage">
                {((avgBaselineWaitTime - avgRlWaitTime) / avgBaselineWaitTime * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
