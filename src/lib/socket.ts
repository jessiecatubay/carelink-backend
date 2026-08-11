import { Server } from "socket.io";
import type { Server as HttpServer } from "http";

let io: Server | null = null;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  return io;
};

export const getSocket = () => {
  if (!io) {
    throw new Error("Socket.io has not been initialized.");
  }

  return io;
};
