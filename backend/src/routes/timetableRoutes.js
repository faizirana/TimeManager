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
 *     description: |
 *       Returns all available timetables.
 *
 *       **Available timetables from seeder:**
 *       - ID 1: Standard shift (09:00 - 17:00) - 9 to 5
 *       - ID 2: Afternoon shift (14:00 - 22:00) - 2 to 10
 *       - ID 3: Early shift (08:00 - 16:00) - 8 to 4
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
 *                 $ref: '#/components/schemas/Timetable'
 *             example:
 *               - id: 1
 *                 Shift_start: "09:00"
 *                 Shift_end: "17:00"
 *               - id: 2
 *                 Shift_start: "14:00"
 *                 Shift_end: "22:00"
 *               - id: 3
 *                 Shift_start: "08:00"
 *                 Shift_end: "16:00"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", authenticate, getTimetables);

/**
 * @swagger
 * /timetables/{id}:
 *   get:
 *     summary: Get a timetable by ID
 *     description: Returns a specific timetable by its ID.
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
 *         example: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved timetable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Timetable'
 *             examples:
 *               standardShift:
 *                 summary: Standard shift (9-5)
 *                 value:
 *                   id: 1
 *                   Shift_start: "09:00"
 *                   Shift_end: "17:00"
 *               afternoonShift:
 *                 summary: Afternoon shift (2-10)
 *                 value:
 *                   id: 2
 *                   Shift_start: "14:00"
 *                   Shift_end: "22:00"
 *               earlyShift:
 *                 summary: Early shift (8-4)
 *                 value:
 *                   id: 3
 *                   Shift_start: "08:00"
 *                   Shift_end: "16:00"
 *       404:
 *         description: Timetable not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Not found"
 *               message: "Timetable with ID 1 not found"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", authenticate, getTimetableById);

/**
 * @swagger
 * /timetables:
 *   post:
 *     summary: Create a new timetable
 *     description: |
 *       Create a new timetable with shift start and end times. Only managers and admins can create timetables.
 *
 *       **Time format:** HH:MM (24-hour format)
 *       **Examples:**
 *       - Standard: 09:00 - 17:00
 *       - Afternoon: 14:00 - 22:00
 *       - Night: 22:00 - 06:00
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
 *                 pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$'
 *                 example: "09:00"
 *                 description: "Shift start time in HH:MM format"
 *               Shift_end:
 *                 type: string
 *                 pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$'
 *                 example: "17:00"
 *                 description: "Shift end time in HH:MM format"
 *           examples:
 *             standardShift:
 *               summary: Standard 9-5 shift
 *               value:
 *                 Shift_start: "09:00"
 *                 Shift_end: "17:00"
 *             afternoonShift:
 *               summary: Afternoon 2-10 shift
 *               value:
 *                 Shift_start: "14:00"
 *                 Shift_end: "22:00"
 *             nightShift:
 *               summary: Night shift
 *               value:
 *                 Shift_start: "22:00"
 *                 Shift_end: "06:00"
 *             flexibleShift:
 *               summary: Flexible 10-6 shift
 *               value:
 *                 Shift_start: "10:00"
 *                 Shift_end: "18:00"
 *     responses:
 *       201:
 *         description: Timetable created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Timetable'
 *             example:
 *               id: 4
 *               Shift_start: "09:00"
 *               Shift_end: "17:00"
 *       400:
 *         description: Bad request - missing required fields or invalid time format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingFields:
 *                 summary: Missing required fields
 *                 value:
 *                   error: "Validation error"
 *                   message: "Shift_start and Shift_end are required"
 *               invalidFormat:
 *                 summary: Invalid time format
 *                 value:
 *                   error: "Validation error"
 *                   message: "Time must be in HH:MM format (e.g., 09:00)"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Only managers and admins can create timetables
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Forbidden"
 *               message: "Only managers and administrators can create timetables"
 */
router.post("/", authenticate, canCreateTimetable, createTimetable);

/**
 * @swagger
 * /timetables/{id}:
 *   put:
 *     summary: Update a timetable
 *     description: |
 *       Update an existing timetable's shift times. Only the team manager using this timetable or admins can update it.
 *
 *       **Example:** Change Team Alpha's standard shift (ID 1) from 9-5 to 8-4
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
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Shift_start:
 *                 type: string
 *                 pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$'
 *                 example: "08:00"
 *               Shift_end:
 *                 type: string
 *                 pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$'
 *                 example: "16:00"
 *           examples:
 *             adjustStartTime:
 *               summary: Start 1 hour earlier
 *               value:
 *                 Shift_start: "08:00"
 *             adjustEndTime:
 *               summary: End 1 hour later
 *               value:
 *                 Shift_end: "18:00"
 *             completeChange:
 *               summary: Change to afternoon shift
 *               value:
 *                 Shift_start: "14:00"
 *                 Shift_end: "22:00"
 *     responses:
 *       200:
 *         description: Timetable updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Timetable'
 *             example:
 *               id: 1
 *               Shift_start: "08:00"
 *               Shift_end: "16:00"
 *       400:
 *         description: Invalid time format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Validation error"
 *               message: "Time must be in HH:MM format"
 *       404:
 *         description: Timetable not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Not found"
 *               message: "Timetable with ID 1 not found"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Only the team manager can update this timetable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Forbidden"
 *               message: "Only the team manager or administrator can modify this timetable"
 */
router.put("/:id", authenticate, canModifyTimetable, updateTimetable);

/**
 * @swagger
 * /timetables/{id}:
 *   delete:
 *     summary: Delete a timetable
 *     description: |
 *       Delete a timetable. Only the team manager using this timetable or admins can delete it.
 *
 *       **Warning:** Teams using this timetable will have their id_timetable set to null.
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
 *         example: 3
 *     responses:
 *       200:
 *         description: Timetable deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Timetable deleted successfully"
 *       404:
 *         description: Timetable not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Not found"
 *               message: "Timetable with ID 3 not found"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Only the team manager can delete this timetable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Forbidden"
 *               message: "Only the team manager or administrator can delete this timetable"
 */
router.delete("/:id", authenticate, canModifyTimetable, deleteTimetable);

export default router;
