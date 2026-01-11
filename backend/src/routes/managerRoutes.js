import express from "express";
import { getAllManagers, getManagerTeam } from "../controllers/managerController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/rolesMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Managers
 *     description: Operations specific to managers
 */

/**
 * @swagger
 * /managers:
 *   get:
 *     summary: Get all managers
 *     description: |
 *       Retrieve a list of all users with the 'manager' role.
 *       **Strictly restricted to the admin role.**
 *     tags: [Managers]
 *     responses:
 *       200:
 *         description: List of managers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Missing token
 *       403:
 *         description: Forbidden - Only admins can access this list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Forbidden"
 *               message: "Access denied. Admin role required."
 */
router.get("/", authenticate, authorize("admin"), getAllManagers);

/**
 * @swagger
 * /managers/{id}/team:
 *   get:
 *     summary: Get manager's team
 *     description: |
 *       Retrieve all employees managed by a specific manager.
 *       - Admins can view any team.
 *       - Managers can view their own team.
 *     tags: [Managers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the manager
 *         example: 2
 *     responses:
 *       200:
 *         description: Team members retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden - Not authorized to view this team
 *       404:
 *         description: Manager not found
 */
router.get("/:id/team", authenticate, authorize("admin", "manager"), getManagerTeam);

export default router;
