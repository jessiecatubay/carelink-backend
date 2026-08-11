import app from "./app";
import { createServer } from "http";
import { initSocket } from "@/lib/socket";

const PORT = process.env.PORT || 8000;

const httpServer = createServer(app);
const io = initSocket(httpServer);

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
