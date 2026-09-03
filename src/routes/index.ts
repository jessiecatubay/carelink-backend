import { Router } from "express";
import userRoutes from "./user.routes"
import deviceRoutes from "./device.routes";
import remoteRoutes from "./remote.routes";

const router = Router();

router.use("/user", userRoutes);
router.use("/device", deviceRoutes);
router.use("/remote", remoteRoutes);

export default router