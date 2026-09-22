import { Request, Response } from "express";
import { z } from "zod";
import {
  getCarelinkResponse,
  AIMessage,
} from "../services/ai.service";

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        text: z.string().min(1),
      }),
    )
    .min(1),
});

export async function chatWithCarelink(
  req: Request,
  res: Response,
) {
  try {
    const parsed = chatSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        status: "error",
        message: "Invalid chat messages",
        errors: parsed.error.flatten(),
      });
    }

    const messages: AIMessage[] = parsed.data.messages;

    const response = await getCarelinkResponse(messages);

    return res.status(200).json({
      success: true,
      status: "success",
      data: {
        response,
      },
    });
  } catch (error) {
    console.error("Carelink AI error:", error);

    return res.status(500).json({
      success: false,
      status: "error",
      message: "Carelink was unable to process your request.",
    });
  }
}