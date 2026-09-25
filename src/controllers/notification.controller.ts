import { Request, Response } from "express";
import { z } from "zod";
import { savePushToken } from "../services/notification.service";
import { AuthenticatedRequest } from "@/middlewares/authenticate-token";

const registerTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.string().optional(),
});

export async function registerPushToken(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        status: "error",
        message: "Unauthorized",
      });
    }

    const parsed = registerTokenSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        status: "error",
        message: "Invalid notification token",
        errors: parsed.error.flatten(),
      });
    }

    const pushToken = await savePushToken(
      req.user.id,
      parsed.data.token,
      parsed.data.platform
    );

    return res.status(200).json({
      success: true,
      status: "success",
      message: "Push token registered successfully",
      data: pushToken,
    });
  } catch (error) {
    console.error("Register push token error:", error);

    return res.status(500).json({
      success: false,
      status: "error",
      message: "Failed to register push token",
    });
  }
}