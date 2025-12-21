import "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      creatorId?: string;
      user?: {
        userId: string;
        email?: string;
      };
    }
  }
}
