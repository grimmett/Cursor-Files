import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const message = `Route ${req.method} ${req.originalUrl} not found`;
  
  console.log(`404 - ${message}`);
  
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};