import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export const generateAccessToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

export const generateRefreshToken = (user, tokenFamily) =>
  jwt.sign(
    {
      id: user.id,
      family: tokenFamily,
      jti: crypto.randomUUID(), // Unique token ID for rotation detection
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" },
  );

export const verifyAccessToken = (token) => jwt.verify(token, ACCESS_TOKEN_SECRET);
export const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_TOKEN_SECRET);
