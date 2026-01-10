import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../src/app.js";
import db from "../models/index.cjs";

let adminToken;
let managerToken;
let managerId;
let manager2Id; // Pour tester qu'un manager ne peut pas voir l'équipe d'un autre

beforeAll(async () => {
  // 1. Nettoyage de la DB
  await db.sequelize.sync({ force: true });
  await db.User.destroy({ where: {} });

  const hashedPassword = await bcrypt.hash("Password123!", 12);

  // 2. Création de l'ADMIN
  await db.User.create({
    name: "Admin",
    surname: "Super",
    email: "admin@test.com",
    password: hashedPassword,
    mobileNumber: "0600000001",
    role: "admin",
  });

  // Login Admin pour récupérer le token
  const resAdmin = await request(app)
    .post("/auth/login")
    .send({ email: "admin@test.com", password: "Password123!" });
  adminToken = resAdmin.body.accessToken;

  // 3. Création du MANAGER 1 (Celui qu'on va utiliser pour les tests)
  const manager1 = await db.User.create({
    name: "Manager",
    surname: "One",
    email: "manager1@test.com",
    password: hashedPassword,
    mobileNumber: "0600000002",
    role: "manager",
  });
  managerId = manager1.id;

  // Login Manager 1 pour récupérer son token
  const resManager = await request(app)
    .post("/auth/login")
    .send({ email: "manager1@test.com", password: "Password123!" });
  managerToken = resManager.body.accessToken;

  // 4. Création du MANAGER 2 (Pour vérifier les restrictions)
  const manager2 = await db.User.create({
    name: "Manager",
    surname: "Two",
    email: "manager2@test.com",
    password: hashedPassword,
    mobileNumber: "0600000003",
    role: "manager",
  });
  manager2Id = manager2.id;

  // 5. Création d'EMPLOYÉS
  // Employé assigné au Manager 1
  await db.User.create({
    name: "Employee",
    surname: "Team1",
    email: "emp1@test.com",
    password: hashedPassword,
    mobileNumber: "0600000010",
    role: "employee",
    id_manager: managerId, // Lien avec Manager 1
  });

  // Employé assigné au Manager 2
  await db.User.create({
    name: "Employee",
    surname: "Team2",
    email: "emp2@test.com",
    password: hashedPassword,
    mobileNumber: "0600000011",
    role: "employee",
    id_manager: manager2Id, // Lien avec Manager 2
  });
});

afterAll(async () => {
  await db.sequelize.close();
});

describe("Manager API Routes", () => {
  // --- Test de GET /managers ---
  describe("GET /managers", () => {
    it("Admin peut récupérer la liste de tous les managers", async () => {
      const res = await request(app).get("/managers").set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      // On doit trouver au moins nos 2 managers créés
      expect(res.body.length).toBeGreaterThanOrEqual(2);
      // Vérifier que le premier élément est bien un manager
      expect(res.body[0].role).toBe("manager");
    });

    it("Manager NE PEUT PAS récupérer la liste des managers (Forbidden)", async () => {
      const res = await request(app)
        .get("/managers")
        .set("Authorization", `Bearer ${managerToken}`);

      expect(res.statusCode).toBe(403); // Middleware authorize('admin') bloque
    });

    it("Utilisateur non authentifié ne peut pas accéder (Unauthorized)", async () => {
      const res = await request(app).get("/managers");
      expect(res.statusCode).toBe(401);
    });
  });

  // --- Test de GET /managers/:id/team ---
  describe("GET /managers/:id/team", () => {
    it("Admin peut voir l'équipe du Manager 1", async () => {
      const res = await request(app)
        .get(`/managers/${managerId}/team`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1); // Il y a 1 employé créé pour Manager 1
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
      // Manager 1 essaie d'accéder à l'ID de Manager 2
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
        .set("Authorization", `Bearer ${adminToken}`); // Admin pour passer la sécu role

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Manager not found");
    });

    it("Vérifie qu'un manager sans équipe retourne une liste vide (et non une erreur)", async () => {
      // Créons un manager 3 sans employé pour ce test rapide
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
      expect(res.body).toEqual([]); // Tableau vide
    });
  });
});
