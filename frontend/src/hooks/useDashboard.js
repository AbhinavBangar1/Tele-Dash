import { useEffect, useState, useRef, useCallback } from "react";
import { getSocket } from "../utils/socket";
import { getDisplacementInMeters } from "../utils/sensors";

const MAX_POINTS = 60;
const MISSING_DATA_TIMEOUT = 15000; // 15s

export function useDashboard() {
  const [connected, setConnected] = useState(false);
  const [stats, setStats] = useState({
    totalPackets: 0,
    connectedDevices: 0,
    connectedDashboards: 0,
    avgLatencyMs: 0,
  });
  
  const [activeDevices, setActiveDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  
  const [accelData, setAccelData] = useState([]);
  const [intensityData, setIntensityData] = useState([]);
  const [gps, setGps] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [anomaly, setAnomaly] = useState(false);
  const [anomalyMessage, setAnomalyMessage] = useState("");

  const anomalyTimer = useRef(null);
  
  // Store all data internally keyed by deviceId
  const deviceDataRef = useRef({});

  const appendPacket = useCallback((packet) => {
    const did = packet.deviceId || "unknown";
    
    if (!deviceDataRef.current[did]) {
      deviceDataRef.current[did] = {
        accelData: [],
        intensityData: [],
        gps: null,
        lastUpdated: null,
        lastGps: null,
      };
      setActiveDevices(prev => {
        if (!prev.includes(did)) {
          // If this is the first device, select it
          if (prev.length === 0) setSelectedDevice(did);
          return [...prev, did];
        }
        return prev;
      });
    }

    const dData = deviceDataRef.current[did];
    
    // Anomaly Detection: GPS Jump
    if (dData.lastGps && packet.gps) {
      const distance = getDisplacementInMeters(
        dData.lastGps.lat, dData.lastGps.lng,
        packet.gps.lat, packet.gps.lng
      );
      const timeDiff = (packet.timestamp - dData.lastUpdated) / 1000;
      if (timeDiff > 0) {
        const speedMps = distance / timeDiff; // m/s
        if (speedMps > 60) { // > 216 km/h is unrealistic for a phone usually, flag jump
          setAnomaly(true);
          setAnomalyMessage(`GPS Jump Detected on ${did.substring(0,6)}`);
          clearTimeout(anomalyTimer.current);
          anomalyTimer.current = setTimeout(() => setAnomaly(false), 5000);
        }
      }
    }

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

    dData.accelData = [...dData.accelData.slice(-MAX_POINTS + 1), point];
    dData.intensityData = [...dData.intensityData.slice(-MAX_POINTS + 1), point];
    
    if (packet.gps) {
      dData.lastGps = dData.gps;
      dData.gps = packet.gps;
    }
    dData.lastUpdated = packet.timestamp;

    // Anomaly Detection: High Intensity
    if ((packet.motionIntensity ?? 0) > 20) {
      setAnomaly(true);
      setAnomalyMessage(`High impact detected on ${did.substring(0,6)}`);
      clearTimeout(anomalyTimer.current);
      anomalyTimer.current = setTimeout(() => setAnomaly(false), 4000);
    }
  }, []);

  // Sync state to selected device
  useEffect(() => {
    if (selectedDevice && deviceDataRef.current[selectedDevice]) {
      const dData = deviceDataRef.current[selectedDevice];
      setAccelData(dData.accelData);
      setIntensityData(dData.intensityData);
      setGps(dData.gps);
      setLastUpdated(dData.lastUpdated);
    } else {
      setAccelData([]);
      setIntensityData([]);
      setGps(null);
      setLastUpdated(null);
    }
  }, [selectedDevice, stats.totalPackets]); // re-run when new packets arrive

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
    
    socket.on("telemetry:offline_synced", ({ deviceId, count }) => {
      setAnomaly(true);
      setAnomalyMessage(`Received ${count} offline packets from ${deviceId.substring(0, 6)}`);
      clearTimeout(anomalyTimer.current);
      anomalyTimer.current = setTimeout(() => setAnomaly(false), 5000);
    });
    
    // Anomaly Detection: Missing Data
    const missingDataCheck = setInterval(() => {
      if (selectedDevice && deviceDataRef.current[selectedDevice]) {
        const lastUpd = deviceDataRef.current[selectedDevice].lastUpdated;
        if (lastUpd && Date.now() - lastUpd > MISSING_DATA_TIMEOUT) {
          setAnomaly(true);
          setAnomalyMessage(`Device ${selectedDevice.substring(0,6)} seems offline`);
          clearTimeout(anomalyTimer.current);
          anomalyTimer.current = setTimeout(() => setAnomaly(false), 4000);
        }
      }
    }, 5000);

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("stats:update");
      socket.off("telemetry:history");
      socket.off("telemetry:packet");
      socket.off("telemetry:offline_synced");
      clearInterval(missingDataCheck);
    };
  }, [appendPacket, selectedDevice]);

  return {
    connected,
    stats,
    activeDevices,
    selectedDevice,
    setSelectedDevice,
    accelData,
    intensityData,
    gps,
    lastUpdated,
    anomaly,
    anomalyMessage,
  };
}
