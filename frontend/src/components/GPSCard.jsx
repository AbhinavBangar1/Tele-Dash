export default function GPSCard({ gps }) {
  return (
    <div className="card flex flex-col gap-3">
      <h2 className="text-xs font-display font-semibold tracking-widest text-dim uppercase">
        GPS Location
      </h2>

      {!gps ? (
        <div className="flex items-center gap-2 text-muted text-xs">
          <span className="w-2 h-2 rounded-full bg-muted" />
          No GPS fix yet
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="LAT" value={gps.lat?.toFixed(6)} unit="°" />
            <Stat label="LNG" value={gps.lng?.toFixed(6)} unit="°" />
            <Stat
              label="ACCURACY"
              value={gps.accuracy != null ? gps.accuracy.toFixed(1) : "—"}
              unit="m"
            />
            <Stat
              label="ALTITUDE"
              value={gps.altitude != null ? gps.altitude.toFixed(1) : "—"}
              unit="m"
            />
            <Stat
              label="SPEED"
              value={gps.speed != null ? (gps.speed * 3.6).toFixed(1) : "—"}
              unit="km/h"
            />
          </div>
          <a
            href={`https://www.google.com/maps?q=${gps.lat},${gps.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            Open in Maps
          </a>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, unit }) {
  return (
    <div className="bg-void rounded p-2 border border-border">
      <p className="text-[10px] text-muted tracking-widest mb-0.5">{label}</p>
      <p className="text-accent font-mono text-sm">
        {value ?? "—"}
        {value && value !== "—" ? (
          <span className="text-dim text-xs ml-0.5">{unit}</span>
        ) : null}
      </p>
    </div>
  );
}
