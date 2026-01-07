import express from "express";
import {
  getTimetables,
  getTimetableById,
  createTimetable,
  updateTimetable,
  deleteTimetable,
} from "../controllers/timetableController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { canCreateTimetable, canModifyTimetable } from "../middleware/timetableMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Timetables
 *   description: Timetable management
 */

/**
 * @swagger
 * /timetables:
 *   get:
 *     summary: Get all timetables
 *     tags: [Timetables]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved timetable list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   Shift_start:
 *                     type: string
 *                     example: "09:00"
 *                   Shift_end:
 *                     type: string
 *                     example: "17:00"
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, getTimetables);

/**
 * @swagger
 * /timetables/{id}:
 *   get:
 *     summary: Get a timetable by ID
 *     tags: [Timetables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The timetable ID
 *     responses:
 *       200:
 *         description: Successfully retrieved timetable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 Shift_start:
 *                   type: string
 *                   example: "09:00"
 *                 Shift_end:
 *                   type: string
 *                   example: "17:00"
 *       404:
 *         description: Timetable not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", authenticate, getTimetableById);

/**
 * @swagger
 * /timetables:
 *   post:
 *     summary: Create a new timetable
 *     tags: [Timetables]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Shift_start
 *               - Shift_end
 *             properties:
 *               Shift_start:
 *                 type: string
 *                 example: "09:00"
 *               Shift_end:
 *                 type: string
 *                 example: "17:00"
 *     responses:
 *       201:
 *         description: Timetable created successfully
 *       400:
 *         description: Bad request - missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only managers and admins can create timetables
 */
router.post("/", authenticate, canCreateTimetable, createTimetable);

/**
 * @swagger
 * /timetables/{id}:
 *   put:
 *     summary: Update a timetable
 *     tags: [Timetables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The timetable ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Shift_start:
 *                 type: string
 *                 example: "09:00"
 *               Shift_end:
 *                 type: string
 *                 example: "17:00"
 *     responses:
 *       404:
 *         description: Timetable not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only the team manager can update this timetable
 */
router.put("/:id", authenticate, canModifyTimetable, updateTimetable);

/**
 * @swagger
 * /timetables/{id}:
 *   delete:
 *     summary: Delete a timetable
 *     tags: [Timetables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The timetable ID
 *     responses:
 *       404:
 *         description: Timetable not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only the team manager can delete this timetable
 */
router.delete("/:id", authenticate, canModifyTimetable, deleteTimetable);

export default router;
