import { PatientNonpatientController } from "@/controllers/patient-nonpatient.controller";
import { authenticateToken } from "@/middlewares/authenticate-token";
import { validateSchema } from "@/middlewares/validate-schema";
import {
  connectSchema,
  connectedNonpatientsSchema,
} from "@/schemas/connection.schema";
import { Router } from "express";

const router = Router();
const patientNonpatientController = new PatientNonpatientController();

router.use(authenticateToken);

router.get(
  "/v1/connected-nonpatients",
  validateSchema(connectedNonpatientsSchema),
  patientNonpatientController.findConnectedNonPatientService,
);

router.post(
  "/v1/connect",
  validateSchema(connectSchema),
  patientNonpatientController.connect,
);

export default router;
