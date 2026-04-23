require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const Telemetry = require("./models/Telemetry");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/telemetry";

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log(`[+] Connected to MongoDB at ${MONGO_URI}`))
  .catch((err) => console.error("[-] MongoDB connection error:", err));

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

const BUFFER_DURATION_MS = 60_000;
let telemetryBuffer = [];

function pruneBuffer() {
  const cutoff = Date.now() - BUFFER_DURATION_MS;
  telemetryBuffer = telemetryBuffer.filter((p) => p.timestamp >= cutoff);
}

let stats = {
  totalPackets: 0,
  connectedDevices: 0,
  connectedDashboards: 0,
  avgLatencyMs: 0,
};

let latencySum = 0;
let latencyCount = 0;

async function processIncomingPacket(packet, isOffline = false) {
  const now = Date.now();
  packet.serverTs = now;
  stats.totalPackets++;

  if (!isOffline && packet.timestamp) {
    const latency = now - packet.timestamp;
    if (latency > 0 && latency < 60000) { // filter out massive outliers
      latencySum += latency;
      latencyCount++;
      stats.avgLatencyMs = Math.round(latencySum / latencyCount);
    }
  }

  // Save to DB asynchronously
  try {
    const doc = new Telemetry(packet);
    await doc.save();
  } catch (err) {
    console.error("Failed to save packet to DB:", err.message);
  }

  if (!isOffline) {
    telemetryBuffer.push(packet);
    pruneBuffer();
    io.to("dashboards").emit("telemetry:packet", packet);
    io.to("dashboards").emit("stats:update", stats);
  }
}

let activeDevicesMap = {}; // maps socket.id -> deviceId

function updateDeviceCount() {
  const uniqueDevices = new Set(Object.values(activeDevicesMap));
  stats.connectedDevices = uniqueDevices.size;
}

io.on("connection", (socket) => {
  console.log(`[+] Socket connected: ${socket.id}`);

  socket.on("register:device", (deviceId) => {
    socket.join("devices");
    if (deviceId) {
      activeDevicesMap[socket.id] = deviceId;
      updateDeviceCount();
    } else {
      // Fallback if deviceId wasn't passed, though it should be now.
      stats.connectedDevices++;
    }
    console.log(`[device] registered: ${socket.id} (${deviceId || 'unknown'})`);
    io.to("dashboards").emit("stats:update", stats);
  });

  socket.on("register:dashboard", () => {
    socket.join("dashboards");
    stats.connectedDashboards++;
    console.log(`[dashboard] registered: ${socket.id}`);
    pruneBuffer();
    socket.emit("telemetry:history", telemetryBuffer);
    socket.emit("stats:update", stats);
  });

  socket.on("telemetry:data", async (packet) => {
    await processIncomingPacket(packet, false);
  });

  socket.on("telemetry:offline_flush", async (packets) => {
    console.log(`[+] Received ${packets.length} offline packets from ${socket.id}`);
    
    let deviceId = "unknown";
    if (packets.length > 0 && packets[0].deviceId) {
      deviceId = packets[0].deviceId;
    }

    for (const packet of packets) {
      await processIncomingPacket(packet, true);
    }
    
    // Notify dashboards that offline data was just synced
    io.to("dashboards").emit("telemetry:offline_synced", {
      deviceId,
      count: packets.length,
    });
  });

  socket.on("disconnect", () => {
    const rooms = Array.from(socket.rooms);
    if (activeDevicesMap[socket.id]) {
      delete activeDevicesMap[socket.id];
      updateDeviceCount();
    } else if (rooms.includes("devices")) {
      stats.connectedDevices = Math.max(0, stats.connectedDevices - 1);
    }
    
    if (rooms.includes("dashboards")) {
      stats.connectedDashboards = Math.max(0, stats.connectedDashboards - 1);
    }
    io.to("dashboards").emit("stats:update", stats);
    console.log(`[-] Socket disconnected: ${socket.id}`);
  });
});

app.get("/health", (req, res) => {
  pruneBuffer();
  res.json({
    status: "ok",
    bufferedPackets: telemetryBuffer.length,
    stats,
  });
});

// History endpoint for the dashboard if needed
app.get("/api/history", async (req, res) => {
  try {
    const { deviceId, limit = 100 } = req.query;
    const query = deviceId ? { deviceId } : {};
    const docs = await Telemetry.find(query).sort({ timestamp: -1 }).limit(parseInt(limit));
    res.json(docs.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`\nTelemetry backend running on http://localhost:${PORT}`);
  console.log(`Accepting connections from: ${CLIENT_URL}\n`);
});
