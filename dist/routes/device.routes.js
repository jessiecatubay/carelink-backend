import { DeviceController } from "@/controllers/device.controller";
import { Router } from "express";
const router = Router();
const deviceController = new DeviceController();
// router.use(authenticateToken);
router.post("/v1/vitals", 
// validateSchema(vitalsSchema),
deviceController.patientVitals);
router.get("/v1/get-full-vitals", 
// validateSchema(paginationRequestSchema),
deviceController.getFullPatientVitals);
router.get("/v1/get-recent-vitals", 
// validateSchema(paginationRequestSchema),
deviceController.getRecentPatientVitals);
router.post("/v1/command", deviceController.command);
export default router;
//# sourceMappingURL=device.routes.js.map