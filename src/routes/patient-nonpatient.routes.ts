import { PatientNonpatientController } from "@/controllers/patient-nonpatient.controller";
import { authenticateToken } from "@/middlewares/authenticate-token";
import { Router } from "express";

const router = Router();
const patientNonpatientController = new PatientNonpatientController();

// Protect all patient-nonpatient connection routes
router.use(authenticateToken);

router.post(
  "/v1/connected-nonpatients",
  patientNonpatientController.findConnectedNonPatient,
);

router.post(
  "/v1/connected-caregivers",
  patientNonpatientController.findConnectedCaregivers,
);

router.post(
  "/v1/preview-patient",
  patientNonpatientController.previewPatient,
);

router.post(
  "/v1/connect",
  patientNonpatientController.connect,
);

router.post(
  "/v1/update",
  patientNonpatientController.update,
);

router.post(
  "/v1/connected-patients",
  patientNonpatientController.findConnectedPatient,
);

export default router;
