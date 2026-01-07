import express from "express";
import rateLimit from "express-rate-limit";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshToken,
} from "../controllers/authController.js";

const router = express.Router();

// Rate limiter pour le login : 5 tentatives par 15 minutes (50 en test pour rapidité)
const loginLimiter = rateLimit({
  windowMs: process.env.NODE_ENV === "test" ? 10 * 1000 : 15 * 60 * 1000, // 10 seconds in test, 15 minutes in production
  max: process.env.NODE_ENV === "test" ? 50 : 5,
  message: "Too many login attempts, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter pour le refresh : 10 tentatives par 15 minutes (50 en test pour rapidité)
const refreshLimiter = rateLimit({
  windowMs: process.env.NODE_ENV === "test" ? 10 * 1000 : 15 * 60 * 1000, // 10 seconds in test, 15 minutes in production
  max: process.env.NODE_ENV === "test" ? 50 : 10,
  message: "Too many refresh requests, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and session management
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user and obtain an access & refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "alice.manager@example.com"
 *               password:
 *                 type: string
 *                 example: "Manager123!"
 *     responses:
 *       200:
 *         description: Login successful, returns access token (refresh token in HttpOnly cookie)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Email or password missing
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", loginLimiter, loginUser);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out the current user (clears refresh token cookie)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", logoutUser);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "newAccessTokenHere"
 *       401:
 *         description: No refresh token provided
 *       403:
 *         description: Invalid refresh token
 *       404:
 *         description: User not found
 */
router.post("/refresh", refreshLimiter, refreshToken);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get the currently authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "1"
 *                 email:
 *                   type: string
 *                   example: "alice.manager@example.com"
 *                 role:
 *                   type: string
 *                   example: "manager"
 *       401:
 *         description: Unauthorized or missing token
 */
router.get("/me", authenticate, getCurrentUser);

export default router;
