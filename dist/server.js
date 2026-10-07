import app from "./app.js";
import { createServer } from "http";
import { initSocket } from "./lib/socket.js";
import { startPillReminderScheduler } from "./services/pill-reminder-scheduler.service.js";
import "./services/mqtt.service.js";
const PORT = Number(process.env.PORT) || 8000;
const httpServer = createServer(app);
initSocket(httpServer);
startPillReminderScheduler();
httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map