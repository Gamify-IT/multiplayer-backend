import { Request, Response, NextFunction } from "express";
import { validateTokenOrThrow } from "./jwtValidator";

// Expand the Express Request interface to include a custom property for the access token
declare global {
  namespace Express {
    interface Request {
      accessToken?: string;
    }
  }
}

/**
 * Middleware to authenticate requests by validating the access token.
 * @param req client request containing the HTTP request data
 * @param res server response used to send the HTTP response
 * @param next following middleware function
 */
const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies["access_token"];
  
  if (!token) {
    res.status(401).json({ error: "Missing Authentication Token" });
    return;
  }

  try {
    await validateTokenOrThrow(token);
    req.accessToken = token;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid Token" });
  }
};

export default authMiddleware;