import { UpdatePatientProfileController } from "../controllers/patient-profile.controller.js";
import { authenticateToken } from "../middlewares/authenticate-token.js";
import { Router } from "express";
const router = Router();
const updatePatientProfileController = new UpdatePatientProfileController();
router.use(authenticateToken);
router.post("/v1/update-patient-profile", updatePatientProfileController.update);
router.post("/v1/generate-connection-code", updatePatientProfileController.generateConnectionCode);
router.post("/v1/register-device-owned", updatePatientProfileController.registerDeviceOwned);
export default router;
//# sourceMappingURL=patient-profile.routes.js.map