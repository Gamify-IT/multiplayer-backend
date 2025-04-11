import { Request, Response, NextFunction } from "express";
import { validateTokenOrThrow } from "./jwtValidator";

declare module "express-serve-static-core" {
  interface Request {
    user?: any;
  }
}

const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies["access_token"];
  if (!token) {
    res.status(401).json({ error: "Missing Authentication Token" });
    return;
  }

  try {
    const decoded = await validateTokenOrThrow(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid Token" });
  }
};

export default authMiddleware;