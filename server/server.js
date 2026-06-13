import "./config/sentry.js"; // ✅ MUST be first import — before everything else
import { initSentry } from "./config/sentry.js";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";

// ✅ Initialize Sentry before anything else
initSentry();

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL || "http://localhost:5173", "https://thcstore.vercel.app"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on("join:user", (userId) => {
    socket.join(`user:${userId}`);
    console.log(`👤 User ${userId} joined their room`);
  });

  socket.on("join:admin", () => {
    socket.join("admin");
    console.log(`🛡️ Admin joined admin room`);
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
});

export default server;
