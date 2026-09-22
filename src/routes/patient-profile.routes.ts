import { UpdatePatientProfileController } from "@/controllers/patient-profile.controller";
import { authenticateToken } from "@/middlewares/authenticate-token";
import { validateSchema } from "@/middlewares/validate-schema";
import {
  generateConnectionCodeSchema,
  patientProfileSchema,
} from "@/schemas/connection.schema";
import { Router } from "express";

const router = Router();
const updatePatientProfileController = new UpdatePatientProfileController();

router.use(authenticateToken);

router.post(
  "/v1/update-patient-profile",
  updatePatientProfileController.update,
);
router.post(
  "/v1/generate-connection-code",
  updatePatientProfileController.generateConnectionCode,
);
router.post(
  "/v1/register-device-owned",
  updatePatientProfileController.registerDeviceOwned,
);

export default router;
