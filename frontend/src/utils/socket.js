import { io } from "socket.io-client";

// Empty string defaults to window.location which seamlessly works via the Vite proxy & Ngrok
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "";

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"], // Allow polling fallback for ngrok
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    });
  }
  return socket;
}
