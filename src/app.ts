import express, { Application, Request, Response } from "express";
import cors from "cors";

const app: Application = express();
import routes from "@/routes";

// Middlewares
app.use(
  cors({
    origin: "http://localhost:8081",
    credentials: true,
  })
);
app.use(express.json());
app.use("/api", routes);


// Test Endpoint
app.get("/api/test", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Express TypeScript backend is working!",
        timestamp: new Date().toISOString()
    });
});

export default app;