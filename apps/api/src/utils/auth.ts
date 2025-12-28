import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header) return res.status(401).json({ error: "No token" });

  try {
    const token = header.split(" ")[1];
    const payload = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
