import { UserController } from "../controllers/user.controller";
import { Router } from "express";

const router = Router();
const userController = new UserController();

router.post("/v1/signup", userController.signup);
router.post("/v1/login", userController.login);

export default router;