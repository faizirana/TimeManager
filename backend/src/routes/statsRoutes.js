import express from "express";
import { getAdminStats } from "../controllers/statsController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/rolesMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Stats
 *   description: Statistics endpoints
 */

/**
 * @swagger
 * /stats/admin:
 *   get:
 *     summary: Get admin statistics
 *     description: Returns comprehensive statistics for admin dashboard (admin only)
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: number
 *                 totalTeams:
 *                   type: number
 *                 totalTimetables:
 *                   type: number
 *                 roles:
 *                   type: object
 *                   properties:
 *                     managers:
 *                       type: number
 *                     employees:
 *                       type: number
 *                     admins:
 *                       type: number
 *                 todayRecordings:
 *                   type: number
 *                 currentlyPresent:
 *                   type: number
 *                 teamsWithoutTimetable:
 *                   type: number
 *                 avgTeamSize:
 *                   type: string
 *                 activeManagers:
 *                   type: number
 *                 inactiveManagers:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       500:
 *         description: Internal server error
 */
router.get("/admin", authenticate, authorize("admin"), getAdminStats);

export default router;
