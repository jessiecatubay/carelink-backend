import { RemoteController } from "@/controllers/remote.controller";
import { Router } from "express";

const router = Router();
const remoteController = new RemoteController();

router.get("/v1/get-all-commands", remoteController.getAllRemoteHistory);

export default router;