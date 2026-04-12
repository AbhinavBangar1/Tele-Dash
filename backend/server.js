require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());


const BUFFER_DURATION_MS = 30_000;
let telemetryBuffer = [];

function pruneBuffer() {
  const cutoff = Date.now() - BUFFER_DURATION_MS;
  telemetryBuffer = telemetryBuffer.filter((p) => p.timestamp >= cutoff);
}


let stats = {
  totalPackets: 0,
  connectedDevices: 0,
  connectedDashboards: 0,
};


io.on("connection", (socket) => {
  console.log(`[+] Socket connected: ${socket.id}`);


  socket.on("register:device", () => {
    socket.join("devices");
    stats.connectedDevices++;
    console.log(`[device] registered: ${socket.id}`);
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


  socket.on("telemetry:data", (packet) => {
    packet.serverTs = Date.now();
    stats.totalPackets++;


    telemetryBuffer.push(packet);
    pruneBuffer();


    io.to("dashboards").emit("telemetry:packet", packet);
    io.to("dashboards").emit("stats:update", stats);
  });


  socket.on("disconnect", () => {
    const rooms = Array.from(socket.rooms);
    if (rooms.includes("devices")) {
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

server.listen(PORT, () => {
  console.log(`\nTelemetry backend running on http://localhost:${PORT}`);
  console.log(`Accepting connections from: ${CLIENT_URL}\n`);
});
