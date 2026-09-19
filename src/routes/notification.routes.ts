import { Router } from "express";
import { registerPushToken } from "../controllers/notification.controller";
import { authenticateToken } from "@/middlewares/authenticate-token";

const router = Router();

// router.use(authenticateToken)

router.post(
  "/v1/register-token",
  registerPushToken
);

export default router;