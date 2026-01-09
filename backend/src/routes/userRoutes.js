import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/rolesMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Returns a list of all users. Managers can see all users, employees see limited information.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Successfully retrieved user list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *             example:
 *               - id: 1
 *                 name: "Alice"
 *                 surname: "Smith"
 *                 mobileNumber: "0987654321"
 *                 email: "alice.manager@example.com"
 *                 role: "manager"
 *                 id_manager: null
 *               - id: 2
 *                 name: "John"
 *                 surname: "Doe"
 *                 mobileNumber: "0123456789"
 *                 email: "john.employee@example.com"
 *                 role: "employee"
 *                 id_manager: 1
 *               - id: 4
 *                 name: "Sarah"
 *                 surname: "Johnson"
 *                 mobileNumber: "0987654322"
 *                 email: "sarah.manager@example.com"
 *                 role: "manager"
 *                 id_manager: 1
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", authenticate, getUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Returns detailed information about a specific user including their manager if applicable.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user to retrieve
 *         example: 2
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/User'
 *                 - type: object
 *                   properties:
 *                     manager:
 *                       $ref: '#/components/schemas/User'
 *             example:
 *               id: 2
 *               name: "John"
 *               surname: "Doe"
 *               mobileNumber: "0123456789"
 *               email: "john.employee@example.com"
 *               role: "employee"
 *               id_manager: 1
 *               manager:
 *                 id: 1
 *                 name: "Alice"
 *                 surname: "Smith"
 *                 email: "alice.manager@example.com"
 *                 role: "manager"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "User with ID 2 not found"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", authenticate, getUserById);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: |
 *       Create a new user account. Requires admin role.
 *
 *       **Role requirements:**
 *       - Admin only can create users
 *       - If role is 'manager' or 'employee', id_manager can be specified
 *       - Password must meet security requirements
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - surname
 *               - mobileNumber
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Mike"
 *               surname:
 *                 type: string
 *                 example: "Brown"
 *               mobileNumber:
 *                 type: string
 *                 pattern: '^[0-9]+$'
 *                 example: "0123456788"
 *                 description: "Numeric phone number"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "mike.employee@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Employee123!"
 *                 description: "Must meet security requirements (min 8 chars, uppercase, lowercase, number, special char)"
 *               role:
 *                 type: string
 *                 enum: [admin, manager, employee]
 *                 example: "employee"
 *               id_manager:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
 *                 description: "Manager ID (optional, can be null for top-level managers)"
 *           examples:
 *             newEmployee:
 *               summary: Create new employee under Alice
 *               value:
 *                 name: "Tom"
 *                 surname: "Taylor"
 *                 mobileNumber: "0123456783"
 *                 email: "new.employee@example.com"
 *                 password: "SecurePass123!"
 *                 role: "employee"
 *                 id_manager: 1
 *             newManager:
 *               summary: Create new manager
 *               value:
 *                 name: "Jane"
 *                 surname: "Manager"
 *                 mobileNumber: "0987654323"
 *                 email: "jane.manager@example.com"
 *                 password: "Manager456!"
 *                 role: "manager"
 *                 id_manager: null
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             example:
 *               id: 11
 *               name: "Tom"
 *               surname: "Taylor"
 *               mobileNumber: "0123456783"
 *               email: "new.employee@example.com"
 *               role: "employee"
 *               id_manager: 1
 *       400:
 *         description: Validation error or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingFields:
 *                 summary: Missing required fields
 *                 value:
 *                   error: "Validation error"
 *                   message: "Missing required fields"
 *                   details:
 *                     missing: ["mobileNumber", "password"]
 *               invalidEmail:
 *                 summary: Invalid email format
 *                 value:
 *                   error: "Validation error"
 *                   message: "Invalid email format"
 *               weakPassword:
 *                 summary: Password doesn't meet requirements
 *                 value:
 *                   error: "Validation error"
 *                   message: "Password must contain at least 8 characters, including uppercase, lowercase, number, and special character"
 *       403:
 *         description: Forbidden - Only admins can create users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Only administrators can create users"
 *       409:
 *         description: Conflict - Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "A user with this email already exists"
 */
router.post("/", authenticate, authorize("admin"), createUser);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user information
 *     description: |
 *       Update user information. Users can update their own profile, admins can update any user.
 *
 *       **Authorization:**
 *       - Employees can only update their own profile
 *       - Managers can update their own profile and their team members
 *       - Admins can update any user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user to update
 *         example: 2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John"
 *               surname:
 *                 type: string
 *                 example: "Smith"
 *               mobileNumber:
 *                 type: string
 *                 example: "0123456789"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.updated@example.com"
 *               role:
 *                 type: string
 *                 enum: [admin, manager, employee]
 *                 example: "employee"
 *                 description: "Only admins can change roles"
 *               id_manager:
 *                 type: integer
 *                 nullable: true
 *                 example: 4
 *                 description: "Only admins can change manager assignments"
 *           example:
 *             name: "John"
 *             surname: "Smith"
 *             mobileNumber: "0123456700"
 *             email: "john.updated@example.com"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             example:
 *               id: 2
 *               name: "John"
 *               surname: "Smith"
 *               mobileNumber: "0123456700"
 *               email: "john.updated@example.com"
 *               role: "employee"
 *               id_manager: 1
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Validation error"
 *               message: "Invalid email format"
 *       403:
 *         description: Forbidden - Not authorized to update this user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "You are not authorized to update this user"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "User with ID 2 not found"
 */
router.put("/:id", authenticate, updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: |
 *       Permanently delete a user account. Only admins can perform this action.
 *
 *       **Warning:** This action cannot be undone and will also delete:
 *       - All time recordings for this user
 *       - Team memberships
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user to delete
 *         example: 10
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *       403:
 *         description: Forbidden - Only admins can delete users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Only administrators can delete users"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "User with ID 10 not found"
 */
router.delete("/:id", authenticate, authorize("admin"), deleteUser);

export default router;
