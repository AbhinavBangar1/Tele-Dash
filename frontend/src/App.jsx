import { Routes, Route, Link, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Device from "./pages/Device";

export default function App() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-void font-mono">
      {/* Top nav */}
      <nav className="flex items-center justify-between px-6 py-3 border-b border-border bg-panel sticky top-0 z-50">
        <span className="font-display text-lg font-bold tracking-widest text-accent glow">
          TELEDASH
        </span>
        <div className="flex gap-1">
          <NavLink to="/" active={pathname === "/"}>Dashboard</NavLink>
          <NavLink to="/device" active={pathname === "/device"}>Device</NavLink>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/device" element={<Device />} />
      </Routes>
    </div>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`px-4 py-1.5 rounded text-sm font-mono transition-all ${
        active
          ? "bg-accent/10 text-accent border border-accent/30"
          : "text-dim hover:text-slate-200"
      }`}
    >
      {children}
    </Link>
  );
}
