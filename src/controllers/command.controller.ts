import { GetAllCommandService, GetLatestCommandService, GetRecentCommandService, UpdateLatestCommandService } from "@/services/command";
import { Request, Response } from "express";
import { getSocket } from "@/lib/socket";

export class CommandController {
  public getAllCommandHistory = async (req: Request, res: Response) => {
    const result = await GetAllCommandService();

    res.status(result.code).json(result);
  };

  public getLatestCommand = async (req: Request, res: Response) => {
    const result = await GetLatestCommandService();

    res.status(result.code).json(result);
  }

  public getRecentCommands = async (req: Request, res:Response) => {
    const result = await GetRecentCommandService();

    res.status(result.code).json(result);
  }

  public updateLatest = async (req: Request, res: Response) => {
    const { status } = req.body;
    const result = await UpdateLatestCommandService({ status });

    res.status(result.code).json(result);
  }
}
