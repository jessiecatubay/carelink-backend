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
  validateSchema(patientProfileSchema),
  updatePatientProfileController.update,
);
router.post(
  "/v1/generate-connection-code",
  validateSchema(generateConnectionCodeSchema),
  updatePatientProfileController.generateConnectionCode,
);

export default router;
