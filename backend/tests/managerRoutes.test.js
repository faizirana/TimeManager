import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../src/app.js";
import db from "../models/index.cjs";

let adminToken;
let managerToken;
let managerId;
let manager2Id; // To test that a manager cannot see another's team

beforeAll(async () => {
  // 1. DB Cleanup
  await db.sequelize.sync({ force: true });
  await db.User.destroy({ where: {} });

  const hashedPassword = await bcrypt.hash("Password123!", 12);

  // 2. Creation of ADMIN
  await db.User.create({
    name: "Admin",
    surname: "Super",
    email: "admin@test.com",
    password: hashedPassword,
    mobileNumber: "0600000001",
    role: "admin",
  });

  // Login Admin to retrieve token
  const resAdmin = await request(app)
    .post("/auth/login")
    .send({ email: "admin@test.com", password: "Password123!" });
  adminToken = resAdmin.body.accessToken;

  // 3. Creation of MANAGER 1 (The one we will use for tests)
  const manager1 = await db.User.create({
    name: "Manager",
    surname: "One",
    email: "manager1@test.com",
    password: hashedPassword,
    mobileNumber: "0600000002",
    role: "manager",
  });
  managerId = manager1.id;

  // Login Manager 1 to retrieve their token
  const resManager = await request(app)
    .post("/auth/login")
    .send({ email: "manager1@test.com", password: "Password123!" });
  managerToken = resManager.body.accessToken;

  // 4. Creation of MANAGER 2 (To verify restrictions)
  const manager2 = await db.User.create({
    name: "Manager",
    surname: "Two",
    email: "manager2@test.com",
    password: hashedPassword,
    mobileNumber: "0600000003",
    role: "manager",
  });
  manager2Id = manager2.id;

  // 5. Creation of EMPLOYEES
  // Employee assigned to Manager 1
  await db.User.create({
    name: "Employee",
    surname: "Team1",
    email: "emp1@test.com",
    password: hashedPassword,
    mobileNumber: "0600000010",
    role: "employee",
    id_manager: managerId, // Link with Manager 1
  });

  // Employee assigned to Manager 2
  await db.User.create({
    name: "Employee",
    surname: "Team2",
    email: "emp2@test.com",
    password: hashedPassword,
    mobileNumber: "0600000011",
    role: "employee",
    id_manager: manager2Id, // Link with Manager 2
  });
});

afterAll(async () => {
  await db.sequelize.close();
});

describe("Manager API Routes", () => {
  // --- GET /managers Test ---
  describe("GET /managers", () => {
    it("Admin peut récupérer la liste de tous les managers", async () => {
      const res = await request(app).get("/managers").set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      // We must find at least our 2 created managers
      expect(res.body.length).toBeGreaterThanOrEqual(2);
      // Verify that the first element is indeed a manager
      expect(res.body[0].role).toBe("manager");
    });

    it("Manager NE PEUT PAS récupérer la liste des managers (Forbidden)", async () => {
      const res = await request(app)
        .get("/managers")
        .set("Authorization", `Bearer ${managerToken}`);

      expect(res.statusCode).toBe(403); // Middleware authorize('admin') blocks it
    });

    it("Utilisateur non authentifié ne peut pas accéder (Unauthorized)", async () => {
      const res = await request(app).get("/managers");
      expect(res.statusCode).toBe(401);
    });
  });

  // --- GET /managers/:id/team Test ---
  describe("GET /managers/:id/team", () => {
    it("Admin peut voir l'équipe du Manager 1", async () => {
      const res = await request(app)
        .get(`/managers/${managerId}/team`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1); // There is 1 employee created for Manager 1
      expect(res.body[0].email).toBe("emp1@test.com");
    });

    it("Manager 1 peut voir sa PROPRE équipe", async () => {
      const res = await request(app)
        .get(`/managers/${managerId}/team`)
        .set("Authorization", `Bearer ${managerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].email).toBe("emp1@test.com");
    });

    it("Manager 1 NE PEUT PAS voir l'équipe du Manager 2", async () => {
      // Manager 1 tries to access Manager 2's ID
      const res = await request(app)
        .get(`/managers/${manager2Id}/team`)
        .set("Authorization", `Bearer ${managerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/Forbidden/i);
    });

    it("Retourne 404 si le manager n'existe pas", async () => {
      const fakeId = 99999;
      const res = await request(app)
        .get(`/managers/${fakeId}/team`)
        .set("Authorization", `Bearer ${adminToken}`); // Admin to bypass role security

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Manager not found");
    });

    it("Vérifie qu'un manager sans équipe retourne une liste vide (et non une erreur)", async () => {
      // Let's create a manager 3 with no employee for this quick test
      const hashedPassword = await bcrypt.hash("Pwd!", 10);
      const emptyManager = await db.User.create({
        name: "Empty",
        surname: "M",
        email: "empty@m.com",
        password: hashedPassword,
        mobileNumber: "0699999999",
        role: "manager",
      });

      const res = await request(app)
        .get(`/managers/${emptyManager.id}/team`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]); // Empty array
    });
  });
});
