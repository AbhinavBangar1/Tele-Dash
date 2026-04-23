import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Device from "./pages/Device";
import History from "./pages/History";

export default function App() {
  const { pathname } = useLocation();
  
  // Use a combination of userAgent and innerWidth for robust mobile detection
  const [isMobile, setIsMobile] = useState(
    /Mobi|Android|iPhone/i.test(navigator.userAgent) || window.innerWidth < 768
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-void font-mono">
        {/* Mobile Header */}
        <div className="flex items-center justify-center py-4 border-b border-border bg-panel">
           <span className="font-display text-lg font-bold tracking-widest text-accent glow">
            TELEDASH
          </span>
        </div>
        <Device />
      </div>
    );
  }

  // Desktop App (or mobile fallback)
  return (
    <div className="min-h-screen bg-void font-mono">
      {/* Desktop Top nav (only shown if not on /device) */}
      {pathname !== "/device" && (
        <nav className="flex items-center justify-between px-6 py-3 border-b border-border bg-panel sticky top-0 z-50">
          <span className="font-display text-lg font-bold tracking-widest text-accent glow">
            TELEDASH
          </span>
          <div className="flex gap-1">
            <NavLink to="/" active={pathname === "/"}>Live Dashboard</NavLink>
            <NavLink to="/history" active={pathname === "/history"}>History</NavLink>
          </div>
        </nav>
      )}

      {/* Minimal header for /device on non-mobile detection */}
      {pathname === "/device" && (
        <div className="flex items-center justify-center py-4 border-b border-border bg-panel">
           <span className="font-display text-lg font-bold tracking-widest text-accent glow">
            TELEDASH
          </span>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/device" element={<Device />} />
        {/* Redirect any other path to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
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
