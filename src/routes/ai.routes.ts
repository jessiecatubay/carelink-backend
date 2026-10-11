import { Router } from "express";
import {
  chatWithCarelink,
  getEmergencyIncidentAdvisory,
} from "../controllers/ai.controller";
import { authenticateToken } from "@/middlewares/authenticate-token";

const router = Router();

router.use(authenticateToken);

router.post("/v1/chat", chatWithCarelink);
router.post("/v1/emergency-advisory", getEmergencyIncidentAdvisory);
router.get("/v1/emergency-advisory", getEmergencyIncidentAdvisory);

export default router;