import { useSensor } from "../hooks/useSensor";

export default function Device() {
  const {
    status,
    error,
    packetCount,
    requestAndStart,
    stopStreaming,
  } = useSensor();

  const isStreaming = status === "streaming";
  const isRequesting = status === "requesting";

  return (
    <main className="max-w-sm mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-accent/30 bg-accent/5 mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00f5a0" strokeWidth="1.5">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-extrabold text-slate-100 tracking-tight">
          Device Mode
        </h1>
        <p className="text-dim text-xs mt-1">
          This page streams your phone's sensors to the dashboard
        </p>
      </div>

      {/* Status card */}
      <div className="card flex flex-col items-center gap-3 py-6">
        <div
          className={`w-4 h-4 rounded-full transition-all duration-500 ${
            isStreaming
              ? "bg-accent shadow-[0_0_12px_#00f5a0] animate-pulse"
              : status === "error"
              ? "bg-danger"
              : "bg-muted"
          }`}
        />
        <p className="text-sm font-mono tracking-widest uppercase text-slate-300">
          {isStreaming
            ? "Streaming"
            : isRequesting
            ? "Requesting permission…"
            : status === "error"
            ? "Error"
            : "Idle"}
        </p>
        {isStreaming && (
          <p className="text-xs text-dim">
            <span className="text-accent font-bold">{packetCount}</span> packets sent
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="border border-danger/40 bg-danger/5 rounded-xl px-4 py-3 text-danger text-xs">
          {error}
        </div>
      )}

      {/* Sensor checklist */}
      <div className="card">
        <p className="text-[10px] text-muted uppercase tracking-widest mb-3">Sensor Support</p>
        <div className="space-y-2">
          <SensorRow label="Accelerometer" available={typeof DeviceMotionEvent !== "undefined"} />
          <SensorRow label="Gyroscope" available={typeof DeviceMotionEvent !== "undefined"} />
          <SensorRow label="GPS" available={"geolocation" in navigator} />
          <SensorRow label="Timestamp" available={true} always />
        </div>
      </div>

      {/* iOS permission note */}
      {typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function" && (
          <div className="border border-warn/30 bg-warn/5 rounded-xl px-4 py-3 text-warn text-xs leading-relaxed">
            <strong>iOS detected:</strong> You'll be asked to allow motion access.
            Tap <em>Allow</em> when prompted.
          </div>
        )}

      {/* CTA */}
      {!isStreaming ? (
        <button
          onClick={requestAndStart}
          disabled={isRequesting}
          className="w-full py-4 rounded-xl bg-accent text-void font-display font-bold text-sm tracking-widest uppercase transition-all hover:bg-accent/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRequesting ? "Requesting…" : "Start Streaming"}
        </button>
      ) : (
        <button
          onClick={stopStreaming}
          className="w-full py-4 rounded-xl border border-danger/50 text-danger font-display font-bold text-sm tracking-widest uppercase hover:bg-danger/10 active:scale-95 transition-all"
        >
          Stop Streaming
        </button>
      )}

      <p className="text-center text-muted text-[10px] tracking-wider">
        Keep this tab open while streaming. Data updates every 200ms.
      </p>
    </main>
  );
}

function SensorRow({ label, available, always }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-dim">{label}</span>
      <span
        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
          always
            ? "border-accent/30 text-accent bg-accent/5"
            : available
            ? "border-accent/30 text-accent bg-accent/5"
            : "border-muted/30 text-muted bg-muted/5"
        }`}
      >
        {always ? "ALWAYS" : available ? "SUPPORTED" : "UNAVAILABLE"}
      </span>
    </div>
  );
}
