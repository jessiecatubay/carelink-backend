import { PatientNonpatientController } from "@/controllers/patient-nonpatient.controller";
import { Router } from "express";
import { authenticateToken } from "@/middlewares/authenticate-token";

const router = Router();
const patientNonpatientController = new PatientNonpatientController();

router.use(authenticateToken);

router.get(
  "/v1/connected-nonpatients",
  patientNonpatientController.findConnectedNonPatientService,
);

router.post("/v1/connect", patientNonpatientController.connect);

export default router;