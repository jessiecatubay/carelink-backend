import { Router } from "express";
import { PillReminderController } from "@/controllers/pill-reminder.controller";
import { authenticateToken } from "@/middlewares/authenticate-token";

const router = Router();
const pillReminderController = new PillReminderController();

router.use(authenticateToken);
router.post("/v1/create", pillReminderController.create);
router.get("/v1/list", pillReminderController.list);
router.put("/v1/update/:id", pillReminderController.update);
router.patch("/v1/update/:id", pillReminderController.update);
router.post("/v1/update", pillReminderController.update);
router.delete("/v1/delete/:id", pillReminderController.delete);
router.delete("/v1/delete", pillReminderController.delete);
router.post("/v1/delete", pillReminderController.delete);

export default router;
