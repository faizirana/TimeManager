import db from "../../models/index.cjs";
import crypto from "crypto";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../service/tokenService.js";
import { hashToken, compareTokenHash } from "../service/hashService.js";

const { User } = db;

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.verifyPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Token family (nouvelle session)
    const tokenFamily = crypto.randomUUID();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user, tokenFamily);

    // Decode to get JTI
    const payload = verifyRefreshToken(refreshToken);

    user.refreshTokenHash = await hashToken(payload.jti); // Hash only the JTI
    user.refreshTokenFamily = tokenFamily;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ accessToken });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      const payload = verifyRefreshToken(token);
      const user = await User.findByPk(payload.id);

      if (user) {
        user.refreshTokenHash = null;
        user.refreshTokenFamily = null;
        await user.save();
      }
    }
  } catch (err) {
    console.log("Logout error:", err.message);
  }

  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logout successful" });
};

export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const payload = verifyRefreshToken(token);

    // Always fetch fresh from database
    const user = await User.findByPk(payload.id);

    if (!user || !user.refreshTokenHash) {
      return res.status(403).json({ message: "Token revoked" });
    }

    // Vérification famille
    if (payload.family !== user.refreshTokenFamily) {
      user.refreshTokenHash = null;
      user.refreshTokenFamily = null;
      await user.save();
      return res.status(403).json({ message: "Token reuse detected" });
    }

    // Compare JTI with stored hash (not the full token)
    const valid = await compareTokenHash(payload.jti, user.refreshTokenHash);

    if (!valid) {
      user.refreshTokenHash = null;
      user.refreshTokenFamily = null;
      await user.save();
      return res.status(403).json({ message: "Token reuse detected" });
    }

    // Generate new token and hash
    const newRefreshToken = generateRefreshToken(user, user.refreshTokenFamily);
    const newPayload = verifyRefreshToken(newRefreshToken);
    const newHash = await hashToken(newPayload.jti); // Hash only the new JTI

    // Update the hash - invalidate the old token immediately
    user.refreshTokenHash = newHash;
    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const newAccessToken = generateAccessToken(user);
    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Refresh error:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export const getCurrentUser = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const user = await User.findByPk(req.user.id, {
    attributes: ["id", "email", "name", "surname", "role", "mobileNumber"],
  });

  if (!user) return res.status(404).json({ message: "User not found" });
  return res.status(200).json(user);
};
