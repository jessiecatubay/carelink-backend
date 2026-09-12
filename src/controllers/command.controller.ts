import {
  GetAllCommandService,
  GetLatestCommandService,
  GetRecentCommandService,
  UpdateLatestCommandService,
} from "@/services/command";
import { Request, Response } from "express";
import { emitSatisfied } from "@/lib/socket";
import { AuthenticatedRequest } from "@/middlewares/authenticate-token";
import { parsePagination } from "@/utils/pagination";

export class CommandController {
  public getAllCommandHistory = async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    if (!req?.user?.id) return;
    const pagination = parsePagination(req.query);

    if ("error" in pagination) {
      return res
        .status(400)
        .json({ success: false, message: pagination.error });
    }

    const result = await GetAllCommandService(req.user.id, pagination);

    res.status(result.code).json(result);
  };

  public getLatestCommand = async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    if (!req?.user?.id) return;
    const result = await GetLatestCommandService(req.user.id);

    res.status(result.code).json(result);
  };

  public getRecentCommands = async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    if (!req?.user?.id) return;
    const result = await GetRecentCommandService(req.user.id);

    res.status(result.code).json(result);
  };
}
