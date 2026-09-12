import { NextFunction, Request, Response } from "express";
import { ZodError, ZodTypeAny } from "zod";

export const validateSchema =
  (schema: ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as {
        body: unknown;
        query: Request["query"];
        params: Request["params"];
      };

      req.body = parsed.body;

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          status: "error",
          message: "Validation failed",
          errors: error.issues.map((issue) => ({
            field: issue.path.join(".") || "request",
            message: issue.message,
          })),
        });
      }

      return next(error);
    }
  };