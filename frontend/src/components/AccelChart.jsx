import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-panel border border-border rounded p-2 text-xs font-mono">
      <p className="text-dim mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.dataKey.toUpperCase()}: {p.value?.toFixed(3)} m/s²
        </p>
      ))}
    </div>
  );
};

export default function AccelChart({ data }) {
  return (
    <div className="card">
      <h2 className="text-xs font-display font-semibold tracking-widest text-dim uppercase mb-4">
        Accelerometer — X / Y / Z
      </h2>
      {data.length === 0 ? (
        <Empty />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="t" tick={{ fill: "#4a5568", fontSize: 9 }} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "#4a5568", fontSize: 9 }} domain={["auto", "auto"]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "10px", paddingTop: "8px", fontFamily: "JetBrains Mono" }}
            />
            <Line type="monotone" dataKey="x" stroke="#00f5a0" dot={false} strokeWidth={1.5} isAnimationActive={false} />
            <Line type="monotone" dataKey="y" stroke="#f5a623" dot={false} strokeWidth={1.5} isAnimationActive={false} />
            <Line type="monotone" dataKey="z" stroke="#7c83fd" dot={false} strokeWidth={1.5} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function Empty() {
  return (
    <div className="h-[220px] flex items-center justify-center text-muted text-xs tracking-widest">
      AWAITING DATA STREAM...
    </div>
  );
}
