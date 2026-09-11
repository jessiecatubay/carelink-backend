import {
  GetAllCommandService,
  GetLatestCommandService,
  GetRecentCommandService,
  UpdateLatestCommandService,
} from "@/services/command";
import { Request, Response } from "express";
import { getSocket } from "@/lib/socket";
import { AuthenticatedRequest } from "@/middlewares/authenticate-token";

export class CommandController {
  public getAllCommandHistory = async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    if (!req?.user?.id) return;
    const result = await GetAllCommandService(req.user.id);

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

  public updateLatest = async (req: AuthenticatedRequest, res: Response) => {
    const { status } = req.body;
    const result = await UpdateLatestCommandService({ status });

    res.status(result.code).json(result);
  };
}
