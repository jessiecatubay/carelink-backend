import { Router } from "express";
import { EmergencyContactController } from "@/controllers/emergency-contact.controller";
import { authenticateToken } from "@/middlewares/authenticate-token";

const router = Router();
const emergencyContactController = new EmergencyContactController();

// Protect all emergency contact routes with authentication
router.use(authenticateToken);

router.post(
  "/v1/get-by-id-emergency-contact",
  emergencyContactController.getById,
);

router.post(
  "/v1/emergency-contacts/patient",
  emergencyContactController.getByPatientProfileId,
);

router.post(
  "/v1/create-emergency-contact",
  emergencyContactController.create,
);

router.put(
  "/v1/update-emergency-contact",
  emergencyContactController.update,
);

router.delete(
  "/v1/delete-emergency-contact",
  emergencyContactController.delete,
);

export default router;