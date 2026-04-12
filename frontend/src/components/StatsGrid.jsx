import { formatTime } from "../utils/sensors";

export default function StatsGrid({ stats, lastUpdated, anomaly }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <StatCard
        label="TOTAL PACKETS"
        value={stats.totalPackets.toLocaleString()}
        color="accent"
      />
      <StatCard
        label="DEVICES ONLINE"
        value={stats.connectedDevices}
        color={stats.connectedDevices > 0 ? "accent" : "muted"}
      />
      <StatCard
        label="DASHBOARDS"
        value={stats.connectedDashboards}
        color="dim"
      />
      <StatCard
        label="LAST PACKET"
        value={lastUpdated ? formatTime(lastUpdated) : "—"}
        color={lastUpdated ? "warn" : "muted"}
      />

      {anomaly && (
        <div className="col-span-2 sm:col-span-4 border border-danger/50 bg-danger/5 rounded-xl px-4 py-3 flex items-center gap-3 animate-pulse_slow">
          <span className="text-danger text-xl">⚡</span>
          <div>
            <p className="text-danger text-sm font-display font-bold tracking-wider">
              ANOMALY DETECTED
            </p>
            <p className="text-danger/70 text-xs">
              Motion intensity exceeded spike threshold (20 m/s²)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colorMap = {
    accent: "text-accent",
    warn: "text-warn",
    danger: "text-danger",
    dim: "text-dim",
    muted: "text-muted",
  };
  return (
    <div className="card flex flex-col gap-1">
      <p className="text-[10px] tracking-widest text-muted uppercase">{label}</p>
      <p className={`text-xl font-display font-bold ${colorMap[color] ?? "text-slate-200"}`}>
        {value}
      </p>
    </div>
  );
}
