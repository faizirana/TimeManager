import express from "express";
import {
  getTimeRecordings,
  getTimeRecordingById,
  createTimeRecording,
  updateTimeRecording,
  deleteTimeRecording,
} from "../controllers/timeRecordingController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/rolesMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: TimeRecordings
 *   description: Time recording management (clock in/out tracking)
 */

/**
 * @swagger
 * /timerecordings:
 *   get:
 *     summary: Get all time recordings (optionally filter by user, date range, or type)
 *     tags: [TimeRecordings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_user
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter records from this date (ISO 8601 format)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter records until this date (ISO 8601 format)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [Arrival, Departure]
 *         description: Filter by recording type
 *     responses:
 *       200:
 *         description: Successfully retrieved time recording list
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
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                     example: "2026-01-07T09:00:00.000Z"
 *                   type:
 *                     type: string
 *                     enum: [Arrival, Departure]
 *                     example: "Arrival"
 *                   id_user:
 *                     type: integer
 *                     example: 2
 *                   user:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 2
 *                       name:
 *                         type: string
 *                         example: "John"
 *                       surname:
 *                         type: string
 *                         example: "Doe"
 *                       email:
 *                         type: string
 *                         example: "john.employee@example.com"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Cannot access other users' time recordings
 */
router.get("/", authenticate, authorize("admin", "manager", "employee"), getTimeRecordings);

/**
 * @swagger
 * /timerecordings/{id}:
 *   get:
 *     summary: Get a time recording by ID
 *     tags: [TimeRecordings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The time recording ID
 *     responses:
 *       200:
 *         description: Successfully retrieved time recording
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-01-07T09:00:00.000Z"
 *                 type:
 *                   type: string
 *                   enum: [Arrival, Departure]
 *                   example: "Arrival"
 *                 id_user:
 *                   type: integer
 *                   example: 2
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 2
 *                     name:
 *                       type: string
 *                       example: "John"
 *                     surname:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
                         example: "john.employee@example.com"
 *       404:
 *         description: Time recording not found
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Cannot access other users' time recordings
 */
router.get("/:id", authenticate, authorize("admin", "manager", "employee"), getTimeRecordingById);

/**
 * @swagger
 * /timerecordings:
 *   post:
 *     summary: Create a new time recording (clock in/out)
 *     description: |
 *       Create a new time recording for clock in/out tracking.
 *
 *       **Authorization Rules:**
 *       - **Employees**: Can only create time recordings for themselves (id_user must match their own user ID)
 *       - **Managers**: Can create time recordings for themselves or their team members
 *       - **Admins**: Can create time recordings for any user
 *
 *       **Important**: Make sure the id_user you specify matches your authorization level.
 *       To create a recording for yourself, use your own user ID (available from GET /auth/me).
 *     tags: [TimeRecordings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - timestamp
 *               - type
 *               - id_user
 *             properties:
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-01-07T09:00:00.000Z"
 *                 description: The date and time of the clock in/out event (ISO 8601 format)
 *               type:
 *                 type: string
 *                 enum: [Arrival, Departure]
 *                 example: "Arrival"
 *                 description: Type of time recording (Arrival or Departure)
 *               id_user:
 *                 type: integer
 *                 example: 3
 *                 description: ID of the user clocking in/out (use your own ID from GET /auth/me or a team member's ID if you're a manager)
 *     responses:
 *       201:
 *         description: Time recording created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-01-07T09:00:00.000Z"
 *                 type:
 *                   type: string
 *                   enum: [Arrival, Departure]
 *                   example: "Arrival"
 *                 id_user:
 *                   type: integer
 *                   example: 3
 *       400:
 *         description: Bad request - Missing required fields, invalid data, or consecutive duplicate type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cannot clock arrival twice without clocking out first"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Cannot create time recordings for users outside your authorization scope
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     employee:
 *                       value: "Forbidden - Employees can only create their own time recordings"
 *                     manager:
 *                       value: "Forbidden - Cannot create time recordings for users outside your team"
 *       404:
 *         description: User not found - The associated user does not exist
 */
router.post("/", authenticate, authorize("admin", "manager", "employee"), createTimeRecording);

/**
 * @swagger
 * /timerecordings/{id}:
 *   put:
 *     summary: Update an existing time recording (managers and admins only)
 *     tags: [TimeRecordings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The time recording ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-01-07T09:30:00.000Z"
 *                 description: Updated timestamp
 *               type:
 *                 type: string
 *                 enum: [Arrival, Departure]
 *                 example: "Departure"
 *                 description: Updated type
 *               id_user:
 *                 type: integer
 *                 example: 2
 *                 description: Updated user ID
 *     responses:
 *       200:
 *         description: Time recording updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-01-07T09:30:00.000Z"
 *                 type:
 *                   type: string
 *                   enum: [Arrival, Departure]
 *                   example: "Departure"
 *                 id_user:
 *                   type: integer
 *                   example: 2
 *       400:
 *         description: Bad request - Invalid data or would create consecutive duplicate types
 *       404:
 *         description: Time recording not found
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - User cannot modify this time recording
 */
router.put("/:id", authenticate, authorize("manager", "admin"), updateTimeRecording);

/**
 * @swagger
 * /timerecordings/{id}:
 *   delete:
 *     summary: Delete a time recording (managers and admins only)
 *     tags: [TimeRecordings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The time recording ID to delete
 *     responses:
 *       200:
 *         description: Time recording deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Time recording deleted successfully"
 *       404:
 *         description: Time recording not found
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - User cannot delete this time recording
 */
router.delete("/:id", authenticate, authorize("manager", "admin"), deleteTimeRecording);

export default router;
