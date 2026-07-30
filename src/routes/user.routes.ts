import { UserController } from "../controllers/user.controller";
import { Router } from "express";
import { Request, Response } from "express";

const router = Router();
const userController = new UserController();

router.post("/v1/signup", userController.signup);
router.get("/v1/test", (req: Request, res: Response) => {
  return res.send("Hello");
})
router.post("/v1/login", userController.login);
router.post(
  "/v1/refresh",
  validateSchema(refreshSchema),
  userController.refresh,
);
router.get("/v1/test", authenticateToken, (req: Request, res: Response) => {
  return res
    .status(200)
    .json({ success: true, message: "Protected route works" });
});
router.post("/v1/user-onboarding", userController.onBoarded);

export default router;