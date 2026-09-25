import app from "./app";
import { createServer } from "http";
import { initSocket } from "@/lib/socket";

import "./services/mqtt.service";

const PORT = process.env.PORT || 8000;

const httpServer = createServer(app);

initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});