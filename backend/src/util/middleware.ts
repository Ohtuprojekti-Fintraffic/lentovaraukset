import { ServiceErrorCode } from '@lentovaraukset/shared/src';
import { NextFunction, Request, Response } from 'express';
import { UniqueConstraintError } from 'sequelize';
import * as z from 'zod';
import { isSpecificServiceError } from './errors';

const handleZodError = (zodError: z.ZodError): { message: string, statusCode: number } => {
  const { message } = zodError;
  const statusCode = 400; // Bad Request
  return { message, statusCode };
};

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof z.ZodError) {
    const { message, statusCode } = handleZodError(err);
    res.status(statusCode).json({ error: { message } });
  } else if (isSpecificServiceError(err, ServiceErrorCode.ReservationExceedsTimeslot)) {
    res.status(400).json({ error: { code: err.errorCode, message: err.message } });
  } else if (err instanceof UniqueConstraintError) {
    const statusCode = 400;
    res.status(statusCode).json({ error: { code: statusCode, message: 'Value already exists' } });
  } else {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong';
    res.status(statusCode).json({ error: { message } });
  }
  next();
};

export default errorHandler;
