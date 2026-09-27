import express from "express";
import cors from "cors";
import routes from "@/routes";
const app = express();
// Middlewares
app.use(cors({
    origin: true,
    credentials: true,
    exposedHeaders: ["X-Access-Token", "X-Refresh-Token"],
}));
app.use(express.json());
app.use("/api", routes);
export default app;
//# sourceMappingURL=app.js.map