import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";



export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  console.log("🔍 Incoming Auth Header:", authHeader);

  if (!authHeader) {
    console.log("❌ No Authorization header");
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log("🔍 Extracted token:", token);

  if (!token) {
    console.log("❌ Token missing after split");
    return res.status(401).json({ error: "Invalid token format" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    console.log("✅ Token decoded:", decoded);
    req.userId = (decoded as any).sub || (decoded as any).userId;
    req.creatorId = (decoded as any).creatorId;
    next();
  } catch (err) {
    console.log("❌ Token verification failed:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
}


export function auth(req: Request, res: Response, next: NextFunction) {
  console.log("🛑 AUTH MIDDLEWARE HIT");
  console.log("REQ HEADERS:", req.headers);
  console.log("AUTH HEADER RAW:", req.headers.authorization);
  const authHeader = req.headers.authorization;
  

  if (!authHeader) {
    console.log("[AUTH] Missing Authorization header");
    return res.status(401).json({ error: "No auth header" });
  }

  const token = authHeader.split(" ")[1];
  console.log("[AUTH] Extracted token:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    console.log("[AUTH] Decoded token:", decoded);
    req.user = {
      userId: decoded.sub,  // NextAuth stores userId in "sub"
      email: decoded.email,
    };
    next();
  } catch(err) {
    console.log("[AUTH] Invalid token:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
}
