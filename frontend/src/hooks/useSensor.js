import { useEffect, useState, useRef } from "react";
import { getSocket } from "../utils/socket";
import { computeIntensity, getDisplacementInMeters } from "../utils/sensors";
import { getOrCreateDeviceId } from "../utils/device";
import { enqueuePacket, flushQueue } from "../utils/offlineQueue";

const BASE_INTERVAL_MS = 2000; // 2 seconds when moving
const STATIONARY_INTERVAL_MS = 10000; // 10 seconds when stationary
const STATIONARY_THRESHOLD_METERS = 5; // < 5 meters displacement
const STATIONARY_INTENSITY_THRESHOLD = 5; // < 5 motion intensity

export function useSensor() {
  const [status, setStatus] = useState("idle"); 
  const [error, setError] = useState(null);
  const [packetCount, setPacketCount] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const [connected, setConnected] = useState(false);

  const accelRef = useRef({ x: 0, y: 0, z: 0 });
  const gyroRef = useRef({ alpha: 0, beta: 0, gamma: 0 });
  const gpsRef = useRef(null);
  const socketRef = useRef(null);
  const intervalRef = useRef(null);
  const watchIdRef = useRef(null);

  const deviceId = getOrCreateDeviceId();
  
  // Smart logic tracking
  const lastGpsRef = useRef(null);
  const lastEmitTimeRef = useRef(0);

  function startStreaming() {
    const socket = getSocket();
    socketRef.current = socket;
    socket.emit("register:device", deviceId);
    setStatus("streaming");
    setConnected(socket.connected);

    socket.on("connect", async () => {
      setConnected(true);
      const queuedPackets = await flushQueue();
      if (queuedPackets.length > 0) {
        socket.emit("telemetry:offline_flush", queuedPackets);
      }
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    const handleMotion = (e) => {
      const a = e.accelerationIncludingGravity || e.acceleration || {};
      accelRef.current = {
        x: parseFloat((a.x ?? 0).toFixed(3)),
        y: parseFloat((a.y ?? 0).toFixed(3)),
        z: parseFloat((a.z ?? 0).toFixed(3)),
      };

      const r = e.rotationRate || {};
      gyroRef.current = {
        alpha: parseFloat((r.alpha ?? 0).toFixed(3)),
        beta: parseFloat((r.beta ?? 0).toFixed(3)),
        gamma: parseFloat((r.gamma ?? 0).toFixed(3)),
      };
    };
    window.addEventListener("devicemotion", handleMotion);

    if ("geolocation" in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          gpsRef.current = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude,
            speed: pos.coords.speed,
          };
        },
        (err) => console.warn("GPS error:", err.message),
        { enableHighAccuracy: true, maximumAge: 2000 }
      );
    }

    // We use a faster interval loop (e.g. 500ms) to check if we SHOULD emit
    // based on our smart transmission logic.
    intervalRef.current = setInterval(async () => {
      const now = Date.now();
      const { x, y, z } = accelRef.current;
      const intensity = computeIntensity(x, y, z);
      
      let displacement = 0;
      if (lastGpsRef.current && gpsRef.current) {
        displacement = getDisplacementInMeters(
          lastGpsRef.current.lat, lastGpsRef.current.lng,
          gpsRef.current.lat, gpsRef.current.lng
        );
      }

      // Smart logic decision
      const isStationary = 
        displacement < STATIONARY_THRESHOLD_METERS && 
        intensity < STATIONARY_INTENSITY_THRESHOLD;
        
      const requiredInterval = isStationary ? STATIONARY_INTERVAL_MS : BASE_INTERVAL_MS;
      
      if (now - lastEmitTimeRef.current >= requiredInterval) {
        const motionState = isStationary ? "stationary" : "moving";
        
        const packet = {
          deviceId,
          timestamp: now,
          accel: accelRef.current,
          gyro: gyroRef.current,
          gps: gpsRef.current,
          motionIntensity: intensity,
          motionState,
        };

        if (socket.connected) {
          socket.emit("telemetry:data", packet);
        } else {
          // Offline Queueing
          await enqueuePacket(packet);
        }

        setPacketCount((c) => c + 1);
        lastEmitTimeRef.current = now;
        if (gpsRef.current) {
          lastGpsRef.current = { ...gpsRef.current };
        }
      }
    }, 500); // check every 500ms

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }

  async function requestAndStart() {
    setStatus("requesting");
    setError(null);
    if (
      typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function"
    ) {
      try {
        const result = await DeviceMotionEvent.requestPermission();
        if (result !== "granted") {
          setError("Motion permission denied. Please allow and try again.");
          setStatus("error");
          return;
        }
      } catch (e) {
        setError("Could not request motion permission: " + e.message);
        setStatus("error");
        return;
      }
    }

    setPermissionGranted(true);
    startStreaming();
  }

  function stopStreaming() {
    clearInterval(intervalRef.current);
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    if (socketRef.current) {
      socketRef.current.off("connect");
      socketRef.current.off("disconnect");
    }
    setStatus("idle");
    setConnected(false);
  }
  
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    status,
    connected,
    error,
    packetCount,
    permissionGranted,
    requestAndStart,
    stopStreaming,
  };
}
