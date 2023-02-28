import { NextFunction, Request, Response } from 'express';
import * as z from 'zod';

const handleZodError = (zodError: z.ZodError): { message: string, statusCode: number } => {
  const { message } = zodError;
  const statusCode = 400; // Bad Request
  return { message, statusCode };
};

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  if (err instanceof z.ZodError) {
    const { message, statusCode } = handleZodError(err);
    res.status(statusCode).json({ error: { message } });
  } else {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong';
    res.status(statusCode).json({ error: { message } });
  }
  next();
};

export default errorHandler;
