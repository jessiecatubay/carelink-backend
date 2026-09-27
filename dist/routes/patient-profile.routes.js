import { UpdatePatientProfileController } from "@/controllers/patient-profile.controller";
import { authenticateToken } from "@/middlewares/authenticate-token";
import { Router } from "express";
const router = Router();
const updatePatientProfileController = new UpdatePatientProfileController();
router.use(authenticateToken);
router.post("/v1/update-patient-profile", 
// validateSchema(patientProfileSchema),
updatePatientProfileController.update);
router.post("/v1/generate-connection-code", 
// validateSchema(generateConnectionCodeSchema),
updatePatientProfileController.generateConnectionCode);
export default router;
//# sourceMappingURL=patient-profile.routes.js.map