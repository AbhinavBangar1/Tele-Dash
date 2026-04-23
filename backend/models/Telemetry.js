const mongoose = require("mongoose");

const telemetrySchema = new mongoose.Schema({
  deviceId: { type: String, required: true, index: true },
  timestamp: { type: Number, required: true, index: true },
  serverTs: { type: Number, required: true },
  
  motionState: { type: String, default: "unknown" },
  motionIntensity: { type: Number, default: 0 },
  
  accel: {
    x: Number,
    y: Number,
    z: Number,
  },
  gyro: {
    alpha: Number,
    beta: Number,
    gamma: Number,
  },
  gps: {
    lat: Number,
    lng: Number,
    accuracy: Number,
    altitude: Number,
    speed: Number,
  }
});

module.exports = mongoose.model("Telemetry", telemetrySchema);
