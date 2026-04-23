export default function AnomalyAlert({ anomaly, message }) {
  if (!anomaly) return null;

  const isSuccess = message?.includes("Received");
  
  const title = isSuccess ? "DATA SYNCED" : "ANOMALY DETECTED";
  const colors = isSuccess 
    ? "bg-accent/10 border-accent/60 text-accent shadow-accent/20" 
    : "bg-danger/10 border-danger/60 text-danger shadow-danger/20";

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-pulse_slow ${colors}`}>
      <div>
        <p className="font-display font-bold tracking-wider text-sm">{title}</p>
        <p className="text-xs opacity-80">{message || "System anomaly detected"}</p>
      </div>
    </div>
  );
}
