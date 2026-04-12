import { formatTime } from "../utils/sensors";

export default function StatusBar({ connected, stats, lastUpdated, anomaly }) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <Pill
        color={connected ? "accent" : "danger"}
        label={connected ? "CONNECTED" : "DISCONNECTED"}
        dot
      />

      <Pill color="dim" label={`${stats.connectedDevices} DEVICE${stats.connectedDevices !== 1 ? "S" : ""}`} />

      <Pill color="dim" label={`${stats.totalPackets.toLocaleString()} PACKETS`} />

      {lastUpdated && (
        <Pill color="dim" label={`LAST: ${formatTime(lastUpdated)}`} />
      )}
      {anomaly && (
        <Pill color="danger" label="⚡ MOTION SPIKE DETECTED" pulse />
      )}
    </div>
  );
}

function Pill({ color, label, dot, pulse }) {
  const colors = {
    accent: "border-accent/40 text-accent",
    danger: "border-danger/40 text-danger",
    dim: "border-border text-dim",
  };
  return (
    <span
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono tracking-wider ${colors[color]} ${
        pulse ? "animate-pulse_slow" : ""
      }`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            color === "accent" ? "bg-accent animate-blink" : "bg-danger animate-blink"
          }`}
        />
      )}
      {label}
    </span>
  );
}
