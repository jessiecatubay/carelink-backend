import { GetAllRemoteService, CreateCommandService } from "@/services/remote";
import { Request, Response } from "express";

export class RemoteController {
  public getAllRemoteHistory = async (req: Request, res: Response) => {
    const result = await GetAllRemoteService();

    res.status(result.code).json(result);
  }
}