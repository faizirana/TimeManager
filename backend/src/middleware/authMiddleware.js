import { verifyAccessToken } from "../service/tokenService.js";

export const authenticate = (req, res, next) => {
  
  let token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;

  if (!token) token = req.cookies?.accessToken;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
