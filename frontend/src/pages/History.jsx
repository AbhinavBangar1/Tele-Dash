import { useState, useEffect } from "react";
import AccelChart from "../components/AccelChart";
import IntensityChart from "../components/IntensityChart";

export default function History() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [limit, setLimit] = useState(100);

  // Fetch all history to find unique devices
  useEffect(() => {
    fetch("/api/history?limit=1000")
      .then((res) => res.json())
      .then((docs) => {
        const unique = [...new Set(docs.map((d) => d.deviceId).filter(Boolean))];
        setDevices(unique);
        if (unique.length > 0 && !selectedDevice) {
          setSelectedDevice(unique[0]);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Fetch history for selected device
  useEffect(() => {
    if (!selectedDevice) return;
    setLoading(true);
    fetch(`/api/history?deviceId=${selectedDevice}&limit=${limit}`)
      .then((res) => res.json())
      .then((docs) => {
        const formatted = docs.map((d) => ({
          t: new Date(d.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          x: d.accel?.x ?? 0,
          y: d.accel?.y ?? 0,
          z: d.accel?.z ?? 0,
          intensity: d.motionIntensity ?? 0,
        }));
        setData(formatted);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedDevice, limit]);

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-100">
            Historical Data
            <span className="text-accent">.</span>
          </h1>
          <p className="text-dim text-xs mt-1 tracking-wide">
            View past telemetry records from the database
          </p>
        </div>

        <div className="flex gap-3">
          <select
            className="bg-void border border-border rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-accent"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value={50}>Last 50</option>
            <option value={200}>Last 200</option>
            <option value={500}>Last 500</option>
            <option value={1000}>Last 1000</option>
          </select>
          {devices.length > 0 && (
            <select
              className="bg-void border border-border rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-accent"
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
            >
              {devices.map((id) => (
                <option key={id} value={id}>
                  {id.substring(0, 8)}...
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-accent animate-pulse">Loading data...</div>
      ) : data.length === 0 ? (
        <div className="card text-center py-20 text-dim">No historical data found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <div className="h-[400px]">
            <AccelChart data={data} />
          </div>
          <div className="h-[400px]">
            <IntensityChart data={data} />
          </div>
        </div>
      )}
    </main>
  );
}
