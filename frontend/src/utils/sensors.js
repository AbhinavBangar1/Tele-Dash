
export function computeIntensity(x, y, z) {
  return parseFloat(Math.sqrt(x * x + y * y + z * z).toFixed(2));
}


export function intensityLevel(value) {
  if (value > 20) return "danger"; 
  if (value > 12) return "warn"; 
  return "normal";
}


export function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
