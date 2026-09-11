import { UserController } from "../controllers/user.controller";
import { Router } from "express";
import { Request, Response } from "express";
import { validateSchema } from "@/middlewares/validate-schema";
import {
  loginSchema,
  refreshSchema,
  signupSchema,
} from "@/schemas/user.schema";
import { AuthMiddleware } from "@/middlewares/auth-middleware";
import { authenticateToken } from "@/middlewares/authenticate-token";

const router = Router();
const userController = new UserController();const authMiddleWare = new AuthMiddleware();

router.post("/v1/signup", userController.signup);
router.post("/v1/login", validateSchema(loginSchema), userController.login);
router.post(
  "/v1/refresh",
  userController.refresh,
);
router.post("/v1/user-onboarding", userController.onBoarded);

router.use(authenticateToken);

router.post("/v1/get-user-by-id", userController.getById);

router.get("/v1/me", authMiddleWare.execute, userController.me);

export default router;
