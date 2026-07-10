import { SignupService, LoginService, UpdateUserService } from "@/services/user"
import { Request, Response } from "express";
import { UserData } from "@/types/user";

export class UserController {
  public signup = async(req: Request, res: Response) => {
    const { firstName, lastName, email, password } = req.body;

    const result = await SignupService(firstName, lastName, email, password);

    return res.status(result.code).json(result);
  }

  public login = async(req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await LoginService(email, password);

    return res.status(result.code).json(result);
  }

  public update = async(req: Request, res: Response) => {
    const { email, ...data }: { email: string } & Partial<UserData> = req.body;

    const result = await UpdateUserService(email, data);

    return res.status(result.code).json(result);
  }
}