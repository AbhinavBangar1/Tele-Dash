import { useEffect, useState, useRef } from "react";
import { getSocket } from "../utils/socket";

const MAX_POINTS = 60;

export function useDashboard() {
  const [connected, setConnected] = useState(false);
  const [stats, setStats] = useState({
    totalPackets: 0,
    connectedDevices: 0,
    connectedDashboards: 0,
  });
  const [accelData, setAccelData] = useState([]);
  const [intensityData, setIntensityData] = useState([]);
  const [gps, setGps] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [anomaly, setAnomaly] = useState(false);

  const anomalyTimer = useRef(null);

  function appendPacket(packet) {
    const point = {
      t: new Date(packet.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      x: packet.accel?.x ?? 0,
      y: packet.accel?.y ?? 0,
      z: packet.accel?.z ?? 0,
      intensity: packet.motionIntensity ?? 0,
    };

    setAccelData((prev) => [...prev.slice(-MAX_POINTS + 1), point]);
    setIntensityData((prev) => [...prev.slice(-MAX_POINTS + 1), point]);

    if (packet.gps) setGps(packet.gps);
    setLastUpdated(packet.timestamp);

    if ((packet.motionIntensity ?? 0) > 20) {
      setAnomaly(true);
      clearTimeout(anomalyTimer.current);
      anomalyTimer.current = setTimeout(() => setAnomaly(false), 4000);
    }
  }

  useEffect(() => {
    const socket = getSocket();

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.emit("register:dashboard");

    socket.on("stats:update", (s) => setStats(s));

    socket.on("telemetry:history", (history) => {
      history.forEach(appendPacket);
    });

    socket.on("telemetry:packet", (packet) => {
      appendPacket(packet);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("stats:update");
      socket.off("telemetry:history");
      socket.off("telemetry:packet");
    };
  }, []);

  return {
    connected,
    stats,
    accelData,
    intensityData,
    gps,
    lastUpdated,
    anomaly,
  };
}
