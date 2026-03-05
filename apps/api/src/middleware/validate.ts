import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        error: "Invalid request",
        details: result.error.issues
      });
    }

    next();
  };

type ValidationSchemas = {
  params?: ZodSchema;
  query?: ZodSchema;
  body?: ZodSchema;
};

export const validateRequest =
  (schemas: ValidationSchemas) =>
  (req: Request, res: Response, next: NextFunction) => {
    const failures: unknown[] = [];

    if (schemas.params) {
      const parsed = schemas.params.safeParse(req.params);
      if (!parsed.success) failures.push(...parsed.error.issues);
    }

    if (schemas.query) {
      const parsed = schemas.query.safeParse(req.query);
      if (!parsed.success) failures.push(...parsed.error.issues);
    }

    if (schemas.body) {
      const parsed = schemas.body.safeParse(req.body);
      if (!parsed.success) failures.push(...parsed.error.issues);
    }

    if (failures.length > 0) {
      return res.status(400).json({
        error: "Invalid request",
        details: failures
      });
    }

    return next();
  };
