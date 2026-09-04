import { CommandController } from "@/controllers/command.controller";
import { Router } from "express";

const router = Router();
const commandController = new CommandController();

router.get("/v1/get-all-commands", commandController.getAllCommandHistory);
router.get("/v1/get-latest-command", commandController.getLatestCommand);
router.get("/v1/get-recent-commands", commandController.getRecentCommands);
router.post("/v1/update-latest", commandController.updateLatest);

export default router;