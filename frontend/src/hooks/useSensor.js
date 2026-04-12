import { useEffect, useState, useRef } from "react";
import { getSocket } from "../utils/socket";
import { computeIntensity } from "../utils/sensors";

const EMIT_INTERVAL_MS = 200; // 5 Hz

export function useSensor() {
  const [status, setStatus] = useState("idle"); 
  const [error, setError] = useState(null);
  const [packetCount, setPacketCount] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const accelRef = useRef({ x: 0, y: 0, z: 0 });
  const gyroRef = useRef({ alpha: 0, beta: 0, gamma: 0 });
  const gpsRef = useRef(null);
  const socketRef = useRef(null);
  const intervalRef = useRef(null);
  const watchIdRef = useRef(null);

  function startStreaming() {
    const socket = getSocket();
    socketRef.current = socket;
    socket.emit("register:device");
    setStatus("streaming");

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

    intervalRef.current = setInterval(() => {
      const { x, y, z } = accelRef.current;
      const packet = {
        timestamp: Date.now(),
        accel: accelRef.current,
        gyro: gyroRef.current,
        gps: gpsRef.current,
        motionIntensity: computeIntensity(x, y, z),
      };
      socket.emit("telemetry:data", packet);
      setPacketCount((c) => c + 1);
    }, EMIT_INTERVAL_MS);

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
    setStatus("idle");
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
    error,
    packetCount,
    permissionGranted,
    requestAndStart,
    stopStreaming,
  };
}
