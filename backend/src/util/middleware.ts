import { ServiceErrorCode } from '@lentovaraukset/shared/src';
import { NextFunction, Request, Response } from 'express';
import { UniqueConstraintError } from 'sequelize';
import * as z from 'zod';
import { isSpecificServiceError } from './errors';

const handleZodError = (zodError: z.ZodError): {
  validationIssues: z.typeToFlattenedError<any, { message: string, code: z.ZodIssueCode }>,
  statusCode: number
  message: string
} => {
  const statusCode = 400; // Bad Request
  // example structure for fieldErrors:
  // {"phone": [{"code": "too_small", "message": "Vaadittu kenttä"}]}
  const validationIssues = zodError.flatten((issue: z.ZodIssue) => ({
    message: issue.message,
    code: issue.code,
  }));
  return { validationIssues, statusCode, message: zodError.message };
};

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof z.ZodError) {
    const { message, statusCode, validationIssues } = handleZodError(err);
    res.status(statusCode).json({ error: { message, validationIssues } });
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
