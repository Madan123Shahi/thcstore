import http from "http";
import { Server } from "socket.io";
import app from "./app.js"; // ✅ import Express app

// ─────────────────────────────────────────────
// ✅ Create HTTP server from Express app
// Socket.io needs raw HTTP server — not Express directly
// ─────────────────────────────────────────────
const server = http.createServer(app);

// ─────────────────────────────────────────────
// ✅ Attach Socket.io
// ─────────────────────────────────────────────
export const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "https://thcstore.vercel.app",
    ],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // ✅ Customer joins their private room
  socket.on("join:user", (userId) => {
    socket.join(`user:${userId}`);
    console.log(`👤 User ${userId} joined their room`);
  });

  // ✅ Admin joins admin room
  socket.on("join:admin", () => {
    socket.join("admin");
    console.log(`🛡️ Admin joined admin room`);
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ─────────────────────────────────────────────
// ✅ Start server here — not in app.js
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
});

export default server;