import { NextFunction, Request, Response } from 'express';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';
  console.log(err);
  res.status(statusCode).json({
    error: {
      message,
    },
  });
  next();
};

export default errorHandler;
