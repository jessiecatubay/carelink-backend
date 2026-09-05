import { UpdatePatientProfileController } from "@/controllers/patient-profile.controller";
import { Router } from "express";

const router = Router();
const updatePatientProfileController = new UpdatePatientProfileController();

router.post("/v1/update-patient-profile", updatePatientProfileController.update);
router.post("/v1/generate-connection-code", updatePatientProfileController.generateConnectionCode);

export default router;