import db from "../../models/index.cjs";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../service/tokenService.js";

const { User } = db;

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  //console.log('Login attempt with:', { email, password });
  if (!email || !password){
    console.log('Missing email or password');
    return res.status(400).json({ message: "Email and password required" });
  }

  try{
  //console.log('Searching for user with email:', email);
  const user = await User.findOne({ where: { email } });
  //console.log('User found:', !!user);
  if (!user){
    console.log('User not found'); 
    return res.status(401).json({ message: "Invalid credentials" });
  }

  //console.log('Checking password match');
  const isMatch = await user.verifyPassword(password);//bcrypt.compare(password, user.password);
  //console.log('Password match:', isMatch);
  if (!isMatch) {
    console.log('Password does not match');
    return res.status(401).json({ message: "Invalid credentials" });
  }

  //console.log('Generating tokens');
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  //console.log('Tokens generated:', !!accessToken, !!refreshToken);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  //console.log('Sending response');
  res.status(200).json({ accessToken });
  } catch (error) {
    console.error('Login error:', error); // Log détaillé de l'erreur
    res.status(500).json({ message: "Internal server error", error: error.message }); // Retourner le message d'erreur
  }
}

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
