import { validateTokenOrThrow } from "./jwtValidator";

const authMiddleware = async (req, res, next) => {
  const token = req.cookies["access_token"];
  if (!token) return res.status(401).json({ error: "Missing Authentification Token" });

  try {
    const decoded = await validateTokenOrThrow(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token ungültig" });
  }
};

export default authMiddleware;