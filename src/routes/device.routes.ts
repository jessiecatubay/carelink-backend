import { DeviceController } from "@/controllers/device.controller";
import { Router } from "express";

const router = Router();
const deviceController = new DeviceController;

router.post("/v1/vitals", deviceController.patientVitals);
router.get("/v1/get-full-vitals", deviceController.getFullPatientVitals);
router.get("/v1/get-recent-vitals", deviceController.getRecentPatientVitals);

export default router;