import { NextFunction, Request, Response } from 'express';

import ErrorResponse from './interfaces/ErrorResponse';
import { getAgent, setupAgent } from './veramo/setup';

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

export function init(req: Request, res: Response, next: NextFunction) {
  setupAgent().then(async ()=>{
    let agent = await getAgent();
    console.log("1-----------");
    let privateKey = "2386d1d21644dc65d4e4b9e2242c5f155cab174916cbc46ad85622cdaeac835c";
    await agent.keyManagerImport({ kms: "local", type: 'Secp256k1', privateKeyHex: privateKey as string });
  });

  next();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response<ErrorResponse>, next: NextFunction) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
}
