import { Router } from "express";
import { PillReminderController } from "@/controllers/pill-reminder.controller";
import { authenticateToken } from "@/middlewares/authenticate-token";

const router = Router();
const pillReminderController = new PillReminderController();

router.use(authenticateToken);
router.post("/v1/create", pillReminderController.create);
router.get("/v1/list", pillReminderController.list);

export default router;
