import { Router } from "express";
import userRoutes from "./user.routes"
import deviceRoutes from "./device.routes";

const router = Router();

router.use("/user", userRoutes);
router.use("/device", deviceRoutes);

export default router