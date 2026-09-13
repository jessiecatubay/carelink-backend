import { authenticateToken } from "@/middlewares/authenticate-token";
import { validateSchema } from "@/middlewares/validate-schema";
import {
  getUserByIdSchema,
  loginSchema,
  onboardingSchema,
  refreshSchema,
  signupSchema,
} from "@/schemas/user.schema";
import { Router } from "express";
import { UserController } from "../controllers/user.controller";

const router = Router();
const userController = new UserController();

router.post("/v1/signup", validateSchema(signupSchema), userController.signup);
router.post("/v1/login", validateSchema(loginSchema), userController.login);
router.post(
  "/v1/refresh",
  validateSchema(refreshSchema),
  userController.refresh,
);
router.post(
  "/v1/user-onboarding",
  userController.onBoarded,
);

router.use(authenticateToken);

router.post(
  "/v1/get-user-by-id",
  // validateSchema(getUserByIdSchema),
  userController.getById,
);

router.get("/v1/me", userController.me);

export default router;
