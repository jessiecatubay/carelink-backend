import { Router } from "express";
import { chatWithCarelink } from "../controllers/ai.controller";
import { authenticateToken } from "@/middlewares/authenticate-token";

const router = Router();

router.use(authenticateToken);

router.post("/v1/chat", chatWithCarelink);

export default router;