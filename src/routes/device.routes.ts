import { DeviceController } from "@/controllers/device.controller";
import { Router } from "express";

const router = Router();
const deviceController = new DeviceController;

router.post("/v1/vitals", deviceController.patientVitals);

export default router;