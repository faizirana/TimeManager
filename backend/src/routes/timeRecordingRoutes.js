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
 *     description: |
 *       Returns time recordings with optional filters. Managers see their team's recordings, employees see only their own.
 *
 *       **Example queries:**
 *       - `/timerecordings?id_user=2` - John's recordings
 *       - `/timerecordings?id_user=2&start_date=2026-01-01T00:00:00.000Z&end_date=2026-01-07T23:59:59.999Z` - John's week
 *       - `/timerecordings?type=Arrival` - All arrivals
 *       - `/timerecordings?start_date=2026-01-06T00:00:00.000Z` - All recordings from Jan 6 onward
 *
 *       **Available test data (2026-01-01 to 2026-01-07, excluding weekends):**
 *       - John (ID 2): Consistent 9-5 worker
 *       - Mike (ID 5): Slightly late arrivals (9:15)
 *       - Lisa (ID 6): Afternoon shift worker (14:00-22:00)
 *       - Emma (ID 7): Early shift worker (08:00-16:00)
 *     tags: [TimeRecordings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_user
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *         example: 2
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter records from this date (ISO 8601 format)
 *         example: "2026-01-01T00:00:00.000Z"
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter records until this date (ISO 8601 format)
 *         example: "2026-01-07T23:59:59.999Z"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [Arrival, Departure]
 *         description: Filter by recording type
 *         example: "Arrival"
 *     responses:
 *       200:
 *         description: Successfully retrieved time recording list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/TimeRecording'
 *                   - type: object
 *                     properties:
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           surname:
 *                             type: string
 *                           email:
 *                             type: string
 *             examples:
 *               johnsWeek:
 *                 summary: John's recordings for one week
 *                 value:
 *                   - id: 1
 *                     timestamp: "2026-01-01T09:00:00.000Z"
 *                     type: "Arrival"
 *                     id_user: 2
 *                     user:
 *                       id: 2
 *                       name: "John"
 *                       surname: "Doe"
 *                       email: "john.employee@example.com"
 *                   - id: 2
 *                     timestamp: "2026-01-01T17:00:00.000Z"
 *                     type: "Departure"
 *                     id_user: 2
 *                     user:
 *                       id: 2
 *                       name: "John"
 *                       surname: "Doe"
 *                       email: "john.employee@example.com"
 *               lisasAfternoonShift:
 *                 summary: Lisa's afternoon shift recording
 *                 value:
 *                   - id: 15
 *                     timestamp: "2026-01-02T14:00:00.000Z"
 *                     type: "Arrival"
 *                     id_user: 6
 *                     user:
 *                       id: 6
 *                       name: "Lisa"
 *                       surname: "Davis"
 *                       email: "lisa.employee@example.com"
 *                   - id: 16
 *                     timestamp: "2026-01-02T22:00:00.000Z"
 *                     type: "Departure"
 *                     id_user: 6
 *               allArrivals:
 *                 summary: All arrivals on Jan 7
 *                 value:
 *                   - id: 50
 *                     timestamp: "2026-01-07T09:00:00.000Z"
 *                     type: "Arrival"
 *                     id_user: 2
 *                   - id: 51
 *                     timestamp: "2026-01-07T09:15:00.000Z"
 *                     type: "Arrival"
 *                     id_user: 5
 *                   - id: 52
 *                     timestamp: "2026-01-07T10:00:00.000Z"
 *                     type: "Arrival"
 *                     id_user: 1
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Cannot access other users' time recordings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Forbidden"
 *               message: "Employees can only view their own time recordings"
 */
router.get("/", authenticate, authorize("admin", "manager", "employee"), getTimeRecordings);

/**
 * @swagger
 * /timerecordings/{id}:
 *   get:
 *     summary: Get a time recording by ID
 *     description: Returns detailed information about a specific time recording including user details.
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
 *         example: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved time recording
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/TimeRecording'
 *                 - type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         surname:
 *                           type: string
 *                         email:
 *                           type: string
 *             examples:
 *               johnArrival:
 *                 summary: John's morning arrival
 *                 value:
 *                   id: 1
 *                   timestamp: "2026-01-07T09:00:00.000Z"
 *                   type: "Arrival"
 *                   id_user: 2
 *                   user:
 *                     id: 2
 *                     name: "John"
 *                     surname: "Doe"
 *                     email: "john.employee@example.com"
 *               lisaDeparture:
 *                 summary: Lisa's late evening departure
 *                 value:
 *                   id: 16
 *                   timestamp: "2026-01-02T22:00:00.000Z"
 *                   type: "Departure"
 *                   id_user: 6
 *                   user:
 *                     id: 6
 *                     name: "Lisa"
 *                     surname: "Davis"
 *                     email: "lisa.employee@example.com"
 *       404:
 *         description: Time recording not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Not found"
 *               message: "Time recording with ID 1 not found"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Cannot access other users' time recordings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Forbidden"
 *               message: "You cannot access time recordings of other employees"
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
 *       **Important notes:**
 *       - Cannot clock in twice without clocking out first (and vice versa)
 *       - To create a recording for yourself, use your own user ID (available from GET /auth/me)
 *       - Timestamp must be in ISO 8601 format
 *
 *       **Example scenarios:**
 *       - John (employee) clocking in: id_user=2, type="Arrival", timestamp="2026-01-08T09:00:00.000Z"
 *       - Lisa (employee) clocking out from afternoon shift: id_user=6, type="Departure", timestamp="2026-01-08T22:00:00.000Z"
 *       - Alice (manager) recording for team member Mike: id_user=5, type="Arrival"
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
 *                 example: "2026-01-08T09:00:00.000Z"
 *                 description: The date and time of the clock in/out event (ISO 8601 format)
 *               type:
 *                 type: string
 *                 enum: [Arrival, Departure]
 *                 example: "Arrival"
 *                 description: Type of time recording (Arrival or Departure)
 *               id_user:
 *                 type: integer
 *                 example: 2
 *                 description: ID of the user clocking in/out (use your own ID from GET /auth/me or a team member's ID if you're a manager)
 *           examples:
 *             johnMorningArrival:
 *               summary: John clocking in (standard 9-5 shift)
 *               value:
 *                 timestamp: "2026-01-08T09:00:00.000Z"
 *                 type: "Arrival"
 *                 id_user: 2
 *             johnEveningDeparture:
 *               summary: John clocking out
 *               value:
 *                 timestamp: "2026-01-08T17:00:00.000Z"
 *                 type: "Departure"
 *                 id_user: 2
 *             lisaAfternoonArrival:
 *               summary: Lisa clocking in (afternoon shift)
 *               value:
 *                 timestamp: "2026-01-08T14:00:00.000Z"
 *                 type: "Arrival"
 *                 id_user: 6
 *             mikeSlightlyLate:
 *               summary: Mike clocking in 15 min late
 *               value:
 *                 timestamp: "2026-01-08T09:15:00.000Z"
 *                 type: "Arrival"
 *                 id_user: 5
 *             emmaEarlyShift:
 *               summary: Emma starting early shift
 *               value:
 *                 timestamp: "2026-01-08T08:00:00.000Z"
 *                 type: "Arrival"
 *                 id_user: 7
 *     responses:
 *       201:
 *         description: Time recording created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TimeRecording'
 *             example:
 *               id: 100
 *               timestamp: "2026-01-08T09:00:00.000Z"
 *               type: "Arrival"
 *               id_user: 2
 *       400:
 *         description: Bad request - Missing required fields, invalid data, or consecutive duplicate type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               duplicateArrival:
 *                 summary: Trying to clock in twice
 *                 value:
 *                   error: "Validation error"
 *                   message: "Cannot clock arrival twice without clocking out first"
 *               duplicateDeparture:
 *                 summary: Trying to clock out twice
 *                 value:
 *                   error: "Validation error"
 *                   message: "Cannot clock departure twice without clocking in first"
 *               missingFields:
 *                 summary: Missing required fields
 *                 value:
 *                   error: "Validation error"
 *                   message: "timestamp, type, and id_user are required"
 *               invalidTimestamp:
 *                 summary: Invalid timestamp format
 *                 value:
 *                   error: "Validation error"
 *                   message: "Timestamp must be in ISO 8601 format (e.g., 2026-01-08T09:00:00.000Z)"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Cannot create time recordings for users outside your authorization scope
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               employeeRestriction:
 *                 summary: Employee trying to clock in for someone else
 *                 value:
 *                   error: "Forbidden"
 *                   message: "Employees can only create their own time recordings"
 *               managerRestriction:
 *                 summary: Manager trying to clock in for non-team member
 *                 value:
 *                   error: "Forbidden"
 *                   message: "Managers can only create time recordings for their team members"
 *       404:
 *         description: User not found - The associated user does not exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Not found"
 *               message: "User with ID 2 not found"
 */
router.post("/", authenticate, authorize("admin", "manager", "employee"), createTimeRecording);

/**
 * @swagger
 * /timerecordings/{id}:
 *   put:
 *     summary: Update an existing time recording (managers and admins only)
 *     description: |
 *       Update a time recording. Only managers and admins can modify time recordings.
 *
 *       **Common use cases:**
 *       - Correcting timestamp errors (e.g., John actually arrived at 9:05, not 9:00)
 *       - Fixing type mistakes (e.g., recorded as Departure instead of Arrival)
 *       - Reassigning to correct user
 *
 *       **Warning:** Be careful not to create consecutive duplicate types
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
 *         example: 1
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
 *                 example: "2026-01-07T09:05:00.000Z"
 *                 description: Updated timestamp
 *               type:
 *                 type: string
 *                 enum: [Arrival, Departure]
 *                 example: "Arrival"
 *                 description: Updated type
 *               id_user:
 *                 type: integer
 *                 example: 2
 *                 description: Updated user ID
 *           examples:
 *             correctTimestamp:
 *               summary: Correct John's arrival time (5 min late)
 *               value:
 *                 timestamp: "2026-01-07T09:05:00.000Z"
 *             fixType:
 *               summary: Fix recording type error
 *               value:
 *                 type: "Departure"
 *             completeUpdate:
 *               summary: Full correction of recording
 *               value:
 *                 timestamp: "2026-01-07T09:30:00.000Z"
 *                 type: "Arrival"
 *                 id_user: 5
 *     responses:
 *       200:
 *         description: Time recording updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TimeRecording'
 *             example:
 *               id: 1
 *               timestamp: "2026-01-07T09:05:00.000Z"
 *               type: "Arrival"
 *               id_user: 2
 *       400:
 *         description: Bad request - Invalid data or would create consecutive duplicate types
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               consecutiveDuplicates:
 *                 summary: Would create two arrivals in a row
 *                 value:
 *                   error: "Validation error"
 *                   message: "This update would create consecutive duplicate recording types"
 *               invalidFormat:
 *                 summary: Invalid timestamp format
 *                 value:
 *                   error: "Validation error"
 *                   message: "Timestamp must be in ISO 8601 format"
 *       404:
 *         description: Time recording not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Not found"
 *               message: "Time recording with ID 1 not found"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Only managers and admins can modify time recordings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Forbidden"
 *               message: "Only managers and administrators can modify time recordings"
 */
router.put("/:id", authenticate, authorize("manager", "admin"), updateTimeRecording);

/**
 * @swagger
 * /timerecordings/{id}:
 *   delete:
 *     summary: Delete a time recording (managers and admins only)
 *     description: |
 *       Permanently delete a time recording. Only managers and admins can delete time recordings.
 *
 *       **Common use cases:**
 *       - Removing erroneous recordings
 *       - Deleting duplicate entries
 *       - Cleaning up test data
 *
 *       **Warning:** This action cannot be undone
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
 *         example: 50
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Not found"
 *               message: "Time recording with ID 50 not found"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Only managers and admins can delete time recordings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Forbidden"
 *               message: "Only managers and administrators can delete time recordings"
 */
router.delete("/:id", authenticate, authorize("manager", "admin"), deleteTimeRecording);

export default router;
