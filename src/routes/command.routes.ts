import { CommandController } from "@/controllers/command.controller";
import { Router } from "express";
import { authenticateToken } from "@/middlewares/authenticate-token";

const router = Router();
const commandController = new CommandController();

router.use(authenticateToken);

router.get("/v1/get-all-commands", commandController.getAllCommandHistory);
router.get("/v1/get-latest-command", commandController.getLatestCommand);
router.get("/v1/get-recent-commands", commandController.getRecentCommands);

export default router;
