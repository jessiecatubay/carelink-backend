import { CommandController } from "@/controllers/command.controller";
import { authenticateToken } from "@/middlewares/authenticate-token";
import { validateSchema } from "@/middlewares/validate-schema";
import { commandQuerySchema } from "@/schemas/command.schema";
import { Router } from "express";

const router = Router();
const commandController = new CommandController();

router.use(authenticateToken);

router.get(
  "/v1/get-all-commands",
  // validateSchema(commandQuerySchema),
  commandController.getAllCommandHistory,
);
router.get(
  "/v1/get-latest-command",
  // validateSchema(commandQuerySchema),
  commandController.getLatestCommand,
);
router.post(
  "/v1/get-recent-commands",
  // validateSchema(commandQuerySchema),
  commandController.getRecentCommands,
);

export default router;
