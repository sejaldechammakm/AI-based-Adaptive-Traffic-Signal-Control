import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

export function LearningProgressChart() {
  const { data: performanceHistory } = useQuery({
    queryKey: ["/api/performance/history?limit=50"],
    refetchInterval: 10000
  });

  const history = (performanceHistory as any[]) || [];
  
  // Generate SVG path for the learning curve
  const generatePath = () => {
    if (history.length < 2) return "";
    
    const width = 400;
    const height = 200;
    const maxEpisode = Math.max(...history.map((h: any) => h.episode), 1);
    const minWaitTime = Math.min(...history.map((h: any) => h.avgWaitTime));
    const maxWaitTime = Math.max(...history.map((h: any) => h.avgWaitTime));
    const waitTimeRange = maxWaitTime - minWaitTime || 1;
    
    const points = history
      .sort((a: any, b: any) => a.episode - b.episode)
      .map((point: any) => {
        const x = (point.episode / maxEpisode) * width;
        const y = height - ((point.avgWaitTime - minWaitTime) / waitTimeRange) * (height - 20);
        return `${x},${y}`;
      });
    
    return `M ${points.join(' L ')}`;
  };

  const currentEpisode = history.length > 0 ? Math.max(...history.map((h: any) => h.episode)) : 0;
  const currentWaitTime = history.length > 0 ? (history[history.length - 1] as any)?.avgWaitTime : 0;

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Learning Progress</h2>
        <div className="relative h-64">
          <div className="absolute inset-0 bg-muted rounded-lg p-4">
            {history.length >= 2 ? (
              <svg className="w-full h-full" viewBox="0 0 400 200" data-testid="learning-progress-chart">
                <path
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  d={generatePath()}
                />
                {/* Current point indicator */}
                {history.length > 0 && (
                  <circle 
                    cx={390} 
                    cy={50} 
                    r="3" 
                    fill="#10b981"
                    data-testid="current-point"
                  />
                )}
              </svg>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <div className="text-lg mb-2">Learning Progress</div>
                  <div className="text-sm" data-testid="text-insufficient-data">
                    Insufficient data for visualization
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between mt-4 text-sm text-muted-foreground">
          <span>Episode 0</span>
          <span data-testid="text-current-progress">
            Current: Episode {currentEpisode.toLocaleString()}
          </span>
        </div>

        {currentWaitTime > 0 && (
          <div className="mt-2 text-center">
            <div className="text-sm text-muted-foreground">
              Current Avg Wait Time: 
              <span className="text-green-400 font-semibold ml-1" data-testid="text-current-wait-time">
                {currentWaitTime.toFixed(1)}s
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
