import { Router } from "express";
import userRoutes from "./user.routes"
import deviceRoutes from "./device.routes";
import commandRoutes from "./command.routes";
import patientProfileRoutes from "./patient-profile.routes";
import patientNonpatientRoutes from "./patient-nonpatient.routes";

const router = Router();

router.use("/user", userRoutes);
router.use("/device", deviceRoutes);
router.use("/command", commandRoutes);
router.use("/patient-profile", patientProfileRoutes);
router.use("/patient-nonpatient", patientNonpatientRoutes);

export default router