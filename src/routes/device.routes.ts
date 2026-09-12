import { DeviceController } from "@/controllers/device.controller";
import { authenticateToken } from "@/middlewares/authenticate-token";
import { validateSchema } from "@/middlewares/validate-schema";
import { deviceCommandSchema, vitalsSchema } from "@/schemas/device.schema";
import { paginationRequestSchema } from "@/schemas/common.schema";
import { Router } from "express";

const router = Router();
const deviceController = new DeviceController();

router.use(authenticateToken);

router.post(
  "/v1/vitals",
  validateSchema(vitalsSchema),
  deviceController.patientVitals,
);
router.get(
  "/v1/get-full-vitals",
  validateSchema(paginationRequestSchema),
  deviceController.getFullPatientVitals,
);
router.get(
  "/v1/get-recent-vitals",
  validateSchema(paginationRequestSchema),
  deviceController.getRecentPatientVitals,
);

router.post(
  "/v1/command",
  validateSchema(deviceCommandSchema),
  deviceController.command,
);

export default router;
