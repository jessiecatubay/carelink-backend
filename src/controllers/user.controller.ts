import { SignupService, LoginService, UpdateUserService } from "@/services/user"
import { Request, Response } from "express";
import { UserData } from "@/types/user";

export class UserController {
  public signup = async(req: Request, res: Response) => {
    const data: UserData = req.body;

    const result = await SignupService(data);

    return res.status(result.code).json(result);
  }

  public login = async(req: Request, res: Response) => {
    const data: Partial<UserData> = req.body;

    const result = await LoginService(data);

    return res.status(result.code).json(result);
  }

  public update = async(req: Request, res: Response) => {
    const email = req.body.email;
    const data: Partial<UserData> = req.body;

    const result = await UpdateUserService(email, data);

    return res.status(result.code).json(result);
  }
}