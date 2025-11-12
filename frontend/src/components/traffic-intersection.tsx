import { SimulationData } from "@shared/schema";

interface TrafficIntersectionProps {
  data?: SimulationData;
}

export function TrafficIntersection({ data }: TrafficIntersectionProps) {
  const intersection = data?.intersection;
  
  const getPhaseStatus = (direction: 'north' | 'south' | 'east' | 'west') => {
    if (!intersection?.currentPhase) return { red: true, yellow: false, green: false };
    
    const phase = intersection.currentPhase;
    
    if (direction === 'north' || direction === 'south') {
      return {
        red: phase === 'EW_GREEN' || phase === 'EW_YELLOW',
        yellow: phase === 'NS_YELLOW',
        green: phase === 'NS_GREEN'
      };
    } else {
      return {
        red: phase === 'NS_GREEN' || phase === 'NS_YELLOW',
        yellow: phase === 'EW_YELLOW', 
        green: phase === 'EW_GREEN'
      };
    }
  };

  const getCurrentPhaseText = () => {
    if (!intersection?.currentPhase) return "Unknown";
    
    switch (intersection.currentPhase) {
      case 'NS_GREEN': return "North-South Green";
      case 'EW_GREEN': return "East-West Green";
      case 'NS_YELLOW': return "North-South Yellow";
      case 'EW_YELLOW': return "East-West Yellow";
      default: return "Transition";
    }
  };

  const renderVehicles = (lane: 'north' | 'south' | 'east' | 'west', count: number) => {
    return Array.from({ length: Math.min(count, 8) }, (_, i) => (
      <div
        key={i}
        className={`vehicle-indicator ${lane === 'east' || lane === 'west' ? 'transform rotate-90' : ''}`}
        data-testid={`vehicle-${lane}-${i}`}
      />
    ));
  };

  return (
    <>
      {/* Intersection View */}
      <div className="relative w-full max-w-2xl mx-auto aspect-square">
        {/* Background intersection */}
        <div className="absolute inset-0 bg-muted rounded-lg"></div>
        
        {/* Roads */}
        <div className="absolute left-1/2 top-0 bottom-0 w-32 bg-gray-700 transform -translate-x-1/2"></div>
        <div className="absolute top-1/2 left-0 right-0 h-32 bg-gray-700 transform -translate-y-1/2"></div>
        
        {/* Lane markings */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-yellow-400 transform -translate-x-1/2"></div>
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-yellow-400 transform -translate-y-1/2"></div>

        {/* Traffic Lights */}
        {/* North */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 p-2 rounded-lg" data-testid="traffic-light-north">
          <div className="flex flex-col items-center">
            <div className={`traffic-light ${getPhaseStatus('north').red ? 'red' : 'off'}`}></div>
            <div className={`traffic-light ${getPhaseStatus('north').yellow ? 'yellow' : 'off'}`}></div>
            <div className={`traffic-light ${getPhaseStatus('north').green ? 'green' : 'off'}`}></div>
            <div className="text-xs text-white mt-1">N</div>
          </div>
        </div>

        {/* South */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 p-2 rounded-lg" data-testid="traffic-light-south">
          <div className="flex flex-col items-center">
            <div className={`traffic-light ${getPhaseStatus('south').red ? 'red' : 'off'}`}></div>
            <div className={`traffic-light ${getPhaseStatus('south').yellow ? 'yellow' : 'off'}`}></div>
            <div className={`traffic-light ${getPhaseStatus('south').green ? 'green' : 'off'}`}></div>
            <div className="text-xs text-white mt-1">S</div>
          </div>
        </div>

        {/* East */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 p-2 rounded-lg" data-testid="traffic-light-east">
          <div className="flex flex-col items-center">
            <div className={`traffic-light ${getPhaseStatus('east').red ? 'red' : 'off'}`}></div>
            <div className={`traffic-light ${getPhaseStatus('east').yellow ? 'yellow' : 'off'}`}></div>
            <div className={`traffic-light ${getPhaseStatus('east').green ? 'green' : 'off'}`}></div>
            <div className="text-xs text-white mt-1">E</div>
          </div>
        </div>

        {/* West */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 p-2 rounded-lg" data-testid="traffic-light-west">
          <div className="flex flex-col items-center">
            <div className={`traffic-light ${getPhaseStatus('west').red ? 'red' : 'off'}`}></div>
            <div className={`traffic-light ${getPhaseStatus('west').yellow ? 'yellow' : 'off'}`}></div>
            <div className={`traffic-light ${getPhaseStatus('west').green ? 'green' : 'off'}`}></div>
            <div className="text-xs text-white mt-1">W</div>
          </div>
        </div>

        {/* Vehicle representations */}
        {/* North lane vehicles */}
        <div className="absolute top-20 left-1/2 transform -translate-x-8 flex flex-col space-y-1" data-testid="vehicles-north">
          {renderVehicles('north', intersection?.northQueue || 0)}
        </div>

        {/* South lane vehicles */}
        <div className="absolute bottom-20 left-1/2 transform translate-x-4 flex flex-col space-y-1" data-testid="vehicles-south">
          {renderVehicles('south', intersection?.southQueue || 0)}
        </div>

        {/* East lane vehicles */}
        <div className="absolute right-20 top-1/2 transform -translate-y-8 flex space-x-1" data-testid="vehicles-east">
          {renderVehicles('east', intersection?.eastQueue || 0)}
        </div>

        {/* West lane vehicles */}
        <div className="absolute left-20 top-1/2 transform translate-y-4 flex space-x-1" data-testid="vehicles-west">
          {renderVehicles('west', intersection?.westQueue || 0)}
        </div>

        {/* Current phase indicator */}
        <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium" data-testid="text-current-phase">
          {getCurrentPhaseText()}
        </div>
      </div>

      {/* Agent Decision Info */}
      <div className="mt-6 bg-muted rounded-lg p-4">
        <h3 className="font-semibold mb-3">Current Agent State</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-chart-1" data-testid="text-north-queue">{intersection?.northQueue || 0}</div>
            <div className="text-sm text-muted-foreground">North Queue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-chart-1" data-testid="text-south-queue">{intersection?.southQueue || 0}</div>
            <div className="text-sm text-muted-foreground">South Queue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-chart-2" data-testid="text-east-queue">{intersection?.eastQueue || 0}</div>
            <div className="text-sm text-muted-foreground">East Queue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-chart-2" data-testid="text-west-queue">{intersection?.westQueue || 0}</div>
            <div className="text-sm text-muted-foreground">West Queue</div>
          </div>
        </div>
      </div>
    </>
  );
}
