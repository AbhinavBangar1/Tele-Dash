import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-panel border border-border rounded p-2 text-xs font-mono">
      <p className="text-dim mb-1">{label}</p>
      <p style={{ color: "#00f5a0" }}>
        INTENSITY: {payload[0]?.value?.toFixed(2)} m/s²
      </p>
    </div>
  );
};

export default function IntensityChart({ data }) {
  return (
    <div className="card">
      <h2 className="text-xs font-display font-semibold tracking-widest text-dim uppercase mb-4">
        Motion Intensity (|a|)
      </h2>
      {data.length === 0 ? (
        <Empty />
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="intensityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f5a0" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00f5a0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="t" tick={{ fill: "#4a5568", fontSize: 9 }} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "#4a5568", fontSize: 9 }} domain={[0, "auto"]} />
            <Tooltip content={<CustomTooltip />} />
            {/* Anomaly threshold line */}
            <ReferenceLine y={20} stroke="#ff4757" strokeDasharray="4 4" label={{ value: "SPIKE", fill: "#ff4757", fontSize: 9 }} />
            <ReferenceLine y={12} stroke="#f5a623" strokeDasharray="4 4" label={{ value: "HIGH", fill: "#f5a623", fontSize: 9 }} />
            <Area
              type="monotone"
              dataKey="intensity"
              stroke="#00f5a0"
              fill="url(#intensityGrad)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function Empty() {
  return (
    <div className="h-[200px] flex items-center justify-center text-muted text-xs tracking-widest">
      AWAITING DATA STREAM...
    </div>
  );
}
