export default function AnomalyAlert({ anomaly }) {
  if (!anomaly) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-danger/10 border border-danger/60 text-danger px-6 py-3 rounded-2xl shadow-2xl shadow-danger/20 flex items-center gap-3 animate-pulse_slow">
      <div>
        <p className="font-display font-bold tracking-wider text-sm">MOTION SPIKE</p>
        <p className="text-xs opacity-80">Intensity &gt; 20 m/s² detected</p>
      </div>
    </div>
  );
}
