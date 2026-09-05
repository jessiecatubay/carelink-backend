import { Router } from "express";
import userRoutes from "./user.routes"
import deviceRoutes from "./device.routes";
import commandRoutes from "./command.routes";
import patientProfileRoutes from "./patient-profile.routes";

const router = Router();

router.use("/user", userRoutes);
router.use("/device", deviceRoutes);
router.use("/command", commandRoutes);
router.use("/patient-profile", patientProfileRoutes);

export default router