import { useDashboard } from "../hooks/useDashboard";
import StatusBar from "../components/StatusBar";
import StatsGrid from "../components/StatsGrid";
import AccelChart from "../components/AccelChart";
import IntensityChart from "../components/IntensityChart";
import GPSCard from "../components/GPSCard";
import AnomalyAlert from "../components/AnomalyAlert";

export default function Dashboard() {
  const {
    connected,
    stats,
    activeDevices,
    selectedDevice,
    setSelectedDevice,
    accelData,
    intensityData,
    gps,
    lastUpdated,
    anomaly,
    anomalyMessage,
  } = useDashboard();

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-100">
            Live Telemetry
            <span className="text-accent">.</span>
          </h1>
          <p className="text-dim text-xs mt-1 tracking-wide">
            Real-time mobile sensor stream via Socket.IO
          </p>
        </div>
        
        {/* Device Selector */}
        {activeDevices.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-dim uppercase tracking-widest">Device:</label>
            <select 
              className="bg-void border border-border rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-accent"
              value={selectedDevice || ""}
              onChange={(e) => setSelectedDevice(e.target.value)}
            >
              {activeDevices.map(id => (
                <option key={id} value={id}>{id.substring(0,8)}...</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Connection + pill status */}
      <StatusBar
        connected={connected}
        stats={stats}
        lastUpdated={lastUpdated}
        anomaly={anomaly}
      />

      {/* Stats cards */}
      <StatsGrid stats={stats} lastUpdated={lastUpdated} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <AccelChart data={accelData} />
        <IntensityChart data={intensityData} />
      </div>

      {/* GPS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GPSCard gps={gps} />

        {/* How to connect hint */}
        <div className="card flex flex-col gap-3">
          <h2 className="text-xs font-display font-semibold tracking-widest text-dim uppercase">
            Connect a Device
          </h2>
          <p className="text-xs text-dim leading-relaxed">
            Open the <span className="text-accent font-semibold">Device</span> page
            on your phone browser to start streaming live sensor data to this
            dashboard.
          </p>
          <div className="bg-void border border-border rounded p-3 text-xs font-mono text-warn space-y-1">
            <p>1. Ensure phone + PC are on same network</p>
            <p>2. Visit <span className="text-accent">http://&lt;your-pc-ip&gt;:5173/device</span></p>
            <p>3. Tap <span className="text-accent">Start Streaming</span></p>
          </div>
        </div>
      </div>

      {/* Floating anomaly toast */}
      <AnomalyAlert anomaly={anomaly} message={anomalyMessage} />
    </main>
  );
}
