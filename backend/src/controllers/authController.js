import db from "../../models/index.cjs";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../service/tokenService";

const { User } = db;

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ accessToken });
};

export const logoutUser = (req, res) => {
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logout successful" });
};

export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No token" });

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    return res.status(403).json({ message: "Invalid token" });
  }

  const user = await User.findByPk(payload.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const newAccessToken = generateAccessToken(user);
  res.status(200).json({ accessToken: newAccessToken });
};

export const getCurrentUser = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const user = await User.findByPk(req.user.id, {
    attributes: ["id", "email", "role"],
  });

  if (!user) return res.status(404).json({ message: "User not found" });
  res.status(200).json(user);
};
