import { formatTime } from "../utils/sensors";

export default function StatsGrid({ stats, lastUpdated }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
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
        label="AVG LATENCY"
        value={stats.avgLatencyMs ? `${stats.avgLatencyMs}ms` : "—"}
        color={stats.avgLatencyMs > 0 ? "warn" : "muted"}
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
