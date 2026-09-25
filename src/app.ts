import express, { Application } from "express";
import cors from "cors";
import routes from "@/routes";

const app: Application = express();

// Middlewares
app.use(
  cors({
    origin: true,
    credentials: true,
    exposedHeaders: ["X-Access-Token", "X-Refresh-Token"],
  }),
);
app.use(express.json());
app.use("/api", routes);

export default app;
