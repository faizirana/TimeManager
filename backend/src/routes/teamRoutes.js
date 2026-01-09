import express from "express";
import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addUserToTeam,
  removeUserFromTeam,
} from "../controllers/teamController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/rolesMiddleware.js";
import { canViewTeam, canManageTeam, canManageTeamMembers } from "../middleware/teamMiddleware.js";

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
 *     description: |
 *       Returns all teams. Can be filtered by user ID to show only teams a specific user belongs to.
 *
 *       **Multi-team membership example:**
 *       - Lisa (user ID 6) is a member of both Team Alpha (ID 1) and Team Beta (ID 2)
 *
 *       **Example query:** /teams?id_user=6
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_user
 *         schema:
 *           type: integer
 *         description: Filter teams by user membership
 *         example: 6
 *     responses:
 *       200:
 *         description: List of teams retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Team'
 *                   - type: object
 *                     properties:
 *                       manager:
 *                         $ref: '#/components/schemas/User'
 *                       timetable:
 *                         $ref: '#/components/schemas/Timetable'
 *                       members:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/User'
 *             examples:
 *               allTeams:
 *                 summary: All teams
 *                 value:
 *                   - id: 1
 *                     name: "Team Alpha"
 *                     id_manager: 1
 *                     id_timetable: 1
 *                     manager:
 *                       id: 1
 *                       name: "Alice"
 *                       surname: "Smith"
 *                       email: "alice.manager@example.com"
 *                       role: "manager"
 *                     timetable:
 *                       id: 1
 *                       Shift_start: "09:00"
 *                       Shift_end: "17:00"
 *                   - id: 2
 *                     name: "Team Beta"
 *                     id_manager: 1
 *                     id_timetable: 2
 *                   - id: 3
 *                     name: "Team Gamma"
 *                     id_manager: 4
 *                     id_timetable: 3
 *               lisasTeams:
 *                 summary: Lisa's teams (multi-membership)
 *                 value:
 *                   - id: 1
 *                     name: "Team Alpha"
 *                     id_manager: 1
 *                     id_timetable: 1
 *                   - id: 2
 *                     name: "Team Beta"
 *                     id_manager: 1
 *                     id_timetable: 2
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", authenticate, getTeams);

/**
 * @swagger
 * /teams/{id}:
 *   get:
 *     summary: Get a specific team by ID
 *     description: Returns detailed information about a team including manager, timetable, and members.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Team ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Team found
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Team'
 *                 - type: object
 *                   properties:
 *                     manager:
 *                       $ref: '#/components/schemas/User'
 *                     timetable:
 *                       $ref: '#/components/schemas/Timetable'
 *                     members:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *             example:
 *               id: 1
 *               name: "Team Alpha"
 *               id_manager: 1
 *               id_timetable: 1
 *               manager:
 *                 id: 1
 *                 name: "Alice"
 *                 surname: "Smith"
 *                 email: "alice.manager@example.com"
 *                 role: "manager"
 *               timetable:
 *                 id: 1
 *                 Shift_start: "09:00"
 *                 Shift_end: "17:00"
 *               members:
 *                 - id: 5
 *                   name: "Mike"
 *                   surname: "Brown"
 *                   email: "mike.employee@example.com"
 *                 - id: 6
 *                   name: "Lisa"
 *                   surname: "Davis"
 *                   email: "lisa.employee@example.com"
 *       403:
 *         description: Forbidden - Cannot view this team
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "You do not have permission to view this team"
 *       404:
 *         description: Team not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Team with ID 1 not found"
 */
router.get("/:id", authenticate, canViewTeam, getTeamById);

/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Create a new team with a manager
 *     description: |
 *       Create a new team. Requires admin or manager role.
 *
 *       **Requirements:**
 *       - id_manager must reference a user with 'manager' role
 *       - id_timetable is optional (can be assigned later)
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
 *                 example: "Team Delta"
 *               id_manager:
 *                 type: integer
 *                 example: 1
 *                 description: "Manager user ID (must have manager role)"
 *               id_timetable:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
 *                 description: "Optional timetable ID"
 *           examples:
 *             basicTeam:
 *               summary: New team without timetable
 *               value:
 *                 name: "Team Delta"
 *                 id_manager: 1
 *             teamWithTimetable:
 *               summary: New team with timetable
 *               value:
 *                 name: "Team Delta"
 *                 id_manager: 4
 *                 id_timetable: 3
 *     responses:
 *       201:
 *         description: Team created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *             example:
 *               id: 4
 *               name: "Team Delta"
 *               id_manager: 1
 *               id_timetable: null
 *       400:
 *         description: Missing parameters or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingName:
 *                 summary: Missing required fields
 *                 value:
 *                   error: "Validation error"
 *                   message: "Team name and manager ID are required"
 *               invalidManager:
 *                 summary: Manager is not a manager role
 *                 value:
 *                   error: "Validation error"
 *                   message: "The specified user is not a manager"
 *       403:
 *         description: Forbidden - Only admins and managers can create teams
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Only administrators and managers can create teams"
 */
router.post("/", authenticate, authorize("admin", "manager"), createTeam);

/**
 * @swagger
 * /teams/{id}:
 *   put:
 *     summary: Update team name, manager, or timetable
 *     description: |
 *       Update team information. Only the team manager or admins can update a team.
 *
 *       **Authorization:** Only team manager or admin
 *
 *       **Note:** The response returns only basic Team fields (id, name, id_manager, id_timetable) without included associations like Timetable or Members.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Team Alpha - Updated"
 *               id_manager:
 *                 type: integer
 *                 example: 4
 *               id_timetable:
 *                 type: integer
 *                 nullable: true
 *                 example: 2
 *           examples:
 *             updateName:
 *               summary: Update team name
 *               value:
 *                 name: "Team Alpha - Rebranded"
 *             changeTimetable:
 *               summary: Assign different timetable
 *               value:
 *                 id_timetable: 2
 *             changeManager:
 *               summary: Reassign team to different manager
 *               value:
 *                 id_manager: 4
 *     responses:
 *       200:
 *         description: Team updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *             example:
 *               id: 1
 *               name: "Team Alpha - Updated"
 *               id_manager: 1
 *               id_timetable: 2
 *       403:
 *         description: Forbidden - Not authorized to manage this team
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "You are not authorized to manage this team"
 *       404:
 *         description: Team not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Team with ID 1 not found"
 */
router.put("/:id", authenticate, canManageTeam, updateTeam);

/**
 * @swagger
 * /teams/{id}:
 *   delete:
 *     summary: Delete a team
 *     description: |
 *       Permanently delete a team. Only the team manager or admins can delete a team.
 *
 *       **Warning:** This will remove all team memberships but will NOT delete users.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 3
 *     responses:
 *       200:
 *         description: Team deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Team deleted successfully"
 *       403:
 *         description: Forbidden - Not authorized to delete this team
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "You are not authorized to delete this team"
 *       404:
 *         description: Team not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Team with ID 3 not found"
 */
router.delete("/:id", authenticate, canManageTeam, deleteTeam);

/**
 * @swagger
 * /teams/{id}/users:
 *   post:
 *     summary: Add a user to a team
 *     description: |
 *       Add a user to a team. Users can be members of multiple teams simultaneously.
 *
 *       **Multi-team membership example:**
 *       - Lisa (ID 6) is already in Team Alpha (1) and can also be added to Team Beta (2)
 *
 *       **Authorization:** Only team manager or admin
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Team ID
 *         example: 2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_user]
 *             properties:
 *               id_user:
 *                 type: integer
 *                 example: 6
 *                 description: "User ID to add (Lisa - already in Team Alpha)"
 *           examples:
 *             addToSecondTeam:
 *               summary: Add Lisa to Team Beta (already in Alpha)
 *               value:
 *                 id_user: 6
 *             addNewMember:
 *               summary: Add Tom to Team Alpha
 *               value:
 *                 id_user: 10
 *     responses:
 *       201:
 *         description: User added to team successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User added to team successfully"
 *       400:
 *         description: Invalid data or user already in team
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               alreadyMember:
 *                 summary: User already in this team
 *                 value:
 *                   error: "Conflict"
 *                   message: "User is already a member of this team"
 *               missingUserId:
 *                 summary: Missing user ID
 *                 value:
 *                   error: "Validation error"
 *                   message: "User ID is required"
 *       403:
 *         description: Forbidden - Not authorized to manage team members
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Forbidden"
 *               message: "You are not authorized to manage this team's members"
 *       404:
 *         description: Team or user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Team or user not found"
 */
router.post("/:id/users", authenticate, canManageTeamMembers, addUserToTeam);

/**
 * @swagger
 * /teams/{id}/users/{userId}:
 *   delete:
 *     summary: Remove a user from a team
 *     description: |
 *       Remove a user from a team. If the user is in multiple teams, they will remain in the other teams.
 *
 *       **Multi-team example:** Removing Lisa (ID 6) from Team Alpha (1) will keep her in Team Beta (2)
 *
 *       **Authorization:** Only team manager or admin
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 6
 *         description: "User ID to remove (e.g., Lisa from Team Alpha)"
 *     responses:
 *       200:
 *         description: User removed from team successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User removed from team successfully"
 *       403:
 *         description: Forbidden - Not authorized to manage team members
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "You are not authorized to manage this team's members"
 *       404:
 *         description: Team, user, or membership not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               teamNotFound:
 *                 summary: Team doesn't exist
 *                 value:
 *                   message: "Team with ID 1 not found"
 *               notAMember:
 *                 summary: User is not in this team
 *                 value:
 *                   message: "User is not a member of this team"
 */
router.delete("/:id/users/:userId", authenticate, canManageTeamMembers, removeUserFromTeam);

export default router;
