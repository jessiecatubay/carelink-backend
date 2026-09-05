import { UserController } from "../controllers/user.controller";
import { Router } from "express";
import { Request, Response } from "express";
import { validateSchema } from "@/middlewares/validate-schema";
import {
  loginSchema,
  refreshSchema,
  signupSchema,
} from "@/schemas/user.schema";
import { authenticateToken } from "@/middlewares/authenticate-token";
import { PatientNonpatientController } from "@/controllers/patient-nonpatient.controller";

const router = Router();
const userController = new UserController();
const patientNonpatientController = new PatientNonpatientController();

router.post("/v1/signup", userController.signup);
router.post("/v1/login", validateSchema(loginSchema), userController.login);
router.post(
  "/v1/refresh",
  validateSchema(refreshSchema),
  userController.refresh,
);
router.post("/v1/user-onboarding", userController.onBoarded);

router.post("/v1/get-user-by-id", userController.getById);
router.post("/v1/connect", patientNonpatientController.connect);

export default router;