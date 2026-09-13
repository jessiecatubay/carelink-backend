import { PatientNonpatientController } from "@/controllers/patient-nonpatient.controller";
import { validateSchema } from "@/middlewares/validate-schema";
import {
  connectSchema,
  connectedNonpatientsSchema,
  updateConnectionSchema,
} from "@/schemas/connection.schema";
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

export default router;
