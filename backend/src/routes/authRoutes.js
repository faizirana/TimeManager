import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshToken
} from "../controllers/authController.js";

const router = express.Router();

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
 *                 example: "kevin@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
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
router.post("/login", loginUser);

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
router.post("/refresh", refreshToken);

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
 *                   example: "kevin@example.com"
 *                 role:
 *                   type: string
 *                   example: "user"
 *       401:
 *         description: Unauthorized or missing token
 */
router.get("/me", authenticate, getCurrentUser);

export default router;
