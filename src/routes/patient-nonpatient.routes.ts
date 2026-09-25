import { PatientNonpatientController } from "@/controllers/patient-nonpatient.controller";
import { Router } from "express";

const router = Router();
const patientNonpatientController = new PatientNonpatientController();

// router.use(authenticateToken);

router.post(
  "/v1/connected-nonpatients",
  // validateSchema(connectedNonpatientsSchema),
  patientNonpatientController.findConnectedNonPatient,
);

router.post(
  "/v1/connect",
  // validateSchema(connectSchema),
  patientNonpatientController.connect,
);

router.post(
  "/v1/update",
  // validateSchema(updateConnectionSchema),
  patientNonpatientController.update,
);

router.post(
  "/v1/connected-patients",
  patientNonpatientController.findConnectedPatient,
);

export default router;
