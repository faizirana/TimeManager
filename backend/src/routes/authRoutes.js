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
 *     description: |
 *       Authenticate with email and password. Returns a JWT access token and sets an HttpOnly refresh token cookie.
 *
 *       **Available test accounts:**
 *       - Manager: alice.manager@example.com / Manager123!
 *       - Employee: john.employee@example.com / Employee123!
 *
 *       **Rate limit:** 5 attempts per 15 minutes (50 in test mode)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             manager:
 *               summary: Login as manager (Alice)
 *               value:
 *                 email: "alice.manager@example.com"
 *                 password: "Manager123!"
 *             employee:
 *               summary: Login as employee (John)
 *               value:
 *                 email: "john.employee@example.com"
 *                 password: "Employee123!"
 *     responses:
 *       200:
 *         description: Login successful, returns access token (refresh token in HttpOnly cookie)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Email or password missing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Validation error"
 *               message: "Email and password are required"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Invalid credentials"
 *               message: "The provided email or password is incorrect"
 *       429:
 *         description: Too many login attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Too many requests"
 *               message: "Too many login attempts, please try again after 15 minutes"
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
 *     description: Returns the full user profile of the currently authenticated user based on the JWT token.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/User'
 *                 - type: object
 *                   properties:
 *                     manager:
 *                       $ref: '#/components/schemas/User'
 *                       description: Manager details (if id_manager is set)
 *             examples:
 *               manager:
 *                 summary: Manager user (Alice)
 *                 value:
 *                   id: 1
 *                   name: "Alice"
 *                   surname: "Smith"
 *                   mobileNumber: "0987654321"
 *                   email: "alice.manager@example.com"
 *                   role: "manager"
 *                   id_manager: null
 *               employee:
 *                 summary: Employee user (John)
 *                 value:
 *                   id: 2
 *                   name: "John"
 *                   surname: "Doe"
 *                   mobileNumber: "0123456789"
 *                   email: "john.employee@example.com"
 *                   role: "employee"
 *                   id_manager: 1
 *                   manager:
 *                     id: 1
 *                     name: "Alice"
 *                     surname: "Smith"
 *                     email: "alice.manager@example.com"
 *                     role: "manager"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Unauthorized"
 *               message: "No token provided or token is invalid"
 */
router.get("/me", authenticate, getCurrentUser);

export default router;
