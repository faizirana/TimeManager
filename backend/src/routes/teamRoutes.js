import express from "express";
import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addUserToTeam,
  removeUserFromTeam,
  validateTeamAssignments,
} from "../controllers/teamController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Team management
 */

/**
 * @swagger
 * /teams:
 *   get:
 *     summary: List all teams (optionally filter by user)
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: number
 *         description: Filter teams by user membership
 *     responses:
 *       200:
 *         description: List of teams retrieved successfully
 */
router.get("/", authenticate, getTeams);

/**
 * @swagger
 * /teams/{id}:
 *   get:
 *     summary: Get a specific team by ID
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: number
 *         required: true
 *         description: Team ID
 *     responses:
 *       200:
 *         description: Team found
 *       404:
 *         description: Team not found
 */
router.get("/:id", authenticate, getTeamById);

/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Create a new team with a manager
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, id_manager]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Team Alpha"
 *               id_manager:
 *                 type: number
 *                 example: 3
 *     responses:
 *       201:
 *         description: Team created successfully
 *       400:
 *         description: Missing parameters or invalid data
 */
router.post("/", authenticate, createTeam);

/**
 * @swagger
 * /teams/{id}:
 *   put:
 *     summary: Update team name or manager
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Team Beta"
 *               id_manager:
 *                 type: number
 *                 example: 5
 *     responses:
 *       200:
 *         description: Team updated successfully
 *       404:
 *         description: Team not found
 */
router.put("/:id", authenticate, updateTeam);

/**
 * @swagger
 * /teams/{id}:
 *   delete:
 *     summary: Delete a team
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Team deleted successfully
 *       404:
 *         description: Team not found
 */
router.delete("/:id", authenticate, deleteTeam);

/**
 * @swagger
 * /teams/{id}/users:
 *   post:
 *     summary: Add a user to a team
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Team ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: number
 *                 example: 12
 *     responses:
 *       201:
 *         description: User added to team
 *       400:
 *         description: Invalid data or conflict detected
 */
router.post("/:id/users", authenticate, addUserToTeam);

/**
 * @swagger
 * /teams/{id}/users/{userId}:
 *   delete:
 *     summary: Remove a user from a team
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: User removed from team
 *       404:
 *         description: Team or user not found
 */
router.delete("/:id/users/:userId", authenticate, removeUserFromTeam);

/**
 * @swagger
 * /teams/validate/conflicts:
 *   post:
 *     summary: Validate user team assignments (no conflicts, manager exists)
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Validation OK
 *       400:
 *         description: Conflict or invalid configuration
 */
router.post("/validate/conflicts", authenticate, validateTeamAssignments);

export default router;
