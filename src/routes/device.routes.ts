import { DeviceController } from "@/controllers/device.controller";
import { Router } from "express";
import { authenticateToken } from "@/middlewares/authenticate-token";

const router = Router();
const deviceController = new DeviceController();

router.use(authenticateToken);

router.post("/v1/vitals", deviceController.patientVitals);
router.get("/v1/get-full-vitals", deviceController.getFullPatientVitals);
router.get("/v1/get-recent-vitals", deviceController.getRecentPatientVitals);

router.post("/v1/command", deviceController.command);

export default router;
