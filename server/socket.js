// server/socket.js
import { Server } from "socket.io";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.ADMIN_URL,
      methods: ["GET", "POST"],
    },
  });

  // Private admin room for notifications
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Admin join the "admin-room" for notifications
    socket.on("join-admin-room", (user) => {
      if (user && user.role === "admin") {
        socket.join("admin-room");
        console.log(`Admin ${user.name || user.email} joined admin-room`);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized!" );
  }
  return io;
};