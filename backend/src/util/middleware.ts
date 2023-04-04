import { ServiceErrorCode } from '@lentovaraukset/shared/src';
import { NextFunction, Request, Response } from 'express';
import { UniqueConstraintError } from 'sequelize';
import * as z from 'zod';
import { Airfield } from '../models';
import ServiceError, { isSpecificServiceError } from './errors';

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

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof z.ZodError) {
    const { message, statusCode, validationIssues } = handleZodError(err);
    res.status(statusCode).json({ error: { message, validationIssues } });
  } else if (isSpecificServiceError(err, ServiceErrorCode.ReservationExceedsTimeslot)) {
    res.status(400).json({ error: { code: err.errorCode, message: err.message } });
  } else if (isSpecificServiceError(err, ServiceErrorCode.InvalidAirfield)) {
    res.status(400).json({ error: { code: err.errorCode, message: err.message } });
  } else if (err instanceof UniqueConstraintError) {
    const statusCode = 400;
    res.status(statusCode).json({ error: { message: 'Value already exists' } });
  } else {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong';
    res.status(statusCode).json({ error: { message } });
  }
  next();
};

export const notFoundHandler = async (req: Request, res: Response) => {
  // Express will not send a message on 404 which can be super confusing
  // with tests that don't check for the status code
  if (!res.writableEnded) { // if response hasn't been sent
    res.status(404).json({ error: { message: 'Route or page not found' } });
  }
};

export const airfieldExtractor = async (req: Request, res: Response, next: NextFunction) => {
  const { airfieldCode } = req.params;
  // this could save the promise instead if blocking is bad
  try {
    req.airfield = await Airfield.findByPk(airfieldCode);
  } finally {
    next();
  }
};

//                                               TS why can I not just type req.airfield is Airfield
export function errorIfNoAirfield(req: Request): asserts req is Omit<Request, 'airfield'> & { airfield: Airfield } {
  if (req.airfield === null) {
    throw new ServiceError(ServiceErrorCode.InvalidAirfield, 'Supplied airfield code could not be found');
  }
}
