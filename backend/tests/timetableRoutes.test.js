import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../src/app.js";
import db from "../models/index.cjs";

let adminToken;
let managerToken;
let userToken;
let timetableId;
let managerId;
let userId;
let teamId;

beforeAll(async () => {
  await db.sequelize.sync({ force: true });

  await db.User.destroy({ where: {} });
  await db.Timetable.destroy({ where: {} });
  await db.Team.destroy({ where: {} });

  const hashedPassword = await bcrypt.hash("Password123!", 12);

  // Créer un admin
  const admin = await db.User.create({
    name: "Admin",
    surname: "User",
    email: "admin@example.com",
    password: hashedPassword,
    mobileNumber: "0601020304",
    role: "admin",
  });

  // Créer un manager
  const manager = await db.User.create({
    name: "Manager",
    surname: "Test",
    email: "manager@example.com",
    password: hashedPassword,
    mobileNumber: "0601020305",
    role: "manager",
  });
  managerId = manager.id;

  // Créer un simple utilisateur
  const user = await db.User.create({
    name: "Simple",
    surname: "User",
    email: "user@example.com",
    password: hashedPassword,
    mobileNumber: "0601020306",
    role: "employee",
  });
  userId = user.id;

  // Obtenir les tokens
  const adminRes = await request(app)
    .post("/auth/login")
    .send({ email: "admin@example.com", password: "Password123!" });
  adminToken = adminRes.body.accessToken;

  const managerRes = await request(app)
    .post("/auth/login")
    .send({ email: "manager@example.com", password: "Password123!" });
  managerToken = managerRes.body.accessToken;

  const userRes = await request(app)
    .post("/auth/login")
    .send({ email: "user@example.com", password: "Password123!" });
  userToken = userRes.body.accessToken;
});

afterAll(async () => {
  await db.sequelize.close();
});

describe("Timetable API", () => {
  describe("POST /timetables", () => {
    it("permet à un admin de créer un timetable", async () => {
      const res = await request(app)
        .post("/timetables")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          Shift_start: "09:00",
          Shift_end: "17:00",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.Shift_start).toBe("09:00");
      expect(res.body.Shift_end).toBe("17:00");

      timetableId = res.body.id;
    });

    it("rejette un timetable si Shift_start >= Shift_end", async () => {
      const res = await request(app)
        .post("/timetables")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          Shift_start: "17:00",
          Shift_end: "09:00",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Shift_start must be before Shift_end");
    });

    it("rejette un timetable si Shift_start === Shift_end", async () => {
      const res = await request(app)
        .post("/timetables")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          Shift_start: "09:00",
          Shift_end: "09:00",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Shift_start must be before Shift_end");
    });

    it("rejette un timetable sans Shift_start", async () => {
      const res = await request(app)
        .post("/timetables")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          Shift_end: "17:00",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Shift_start and Shift_end are required");
    });

    it("rejette un timetable sans Shift_end", async () => {
      const res = await request(app)
        .post("/timetables")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          Shift_start: "09:00",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Shift_start and Shift_end are required");
    });

    it("rejette la création sans token d'authentification", async () => {
      const res = await request(app).post("/timetables").send({
        Shift_start: "09:00",
        Shift_end: "17:00",
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe("GET /timetables", () => {
    it("retourne la liste de tous les timetables", async () => {
      const res = await request(app)
        .get("/timetables")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty("Shift_start");
      expect(res.body[0]).toHaveProperty("Shift_end");
    });

    it("rejette la requête sans token d'authentification", async () => {
      const res = await request(app).get("/timetables");

      expect(res.statusCode).toBe(401);
    });
  });

  describe("GET /timetables/:id", () => {
    it("retourne un timetable par son ID", async () => {
      const res = await request(app)
        .get(`/timetables/${timetableId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(timetableId);
      expect(res.body).toHaveProperty("Shift_start");
      expect(res.body).toHaveProperty("Shift_end");
    });

    it("retourne 404 pour un timetable inexistant", async () => {
      const res = await request(app)
        .get("/timetables/99999")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Timetable not found");
    });

    it("rejette la requête sans token d'authentification", async () => {
      const res = await request(app).get(`/timetables/${timetableId}`);

      expect(res.statusCode).toBe(401);
    });
  });

  describe("PUT /timetables/:id", () => {
    beforeAll(async () => {
      // Créer une team et associer le timetable au manager
      const team = await db.Team.create({
        name: "Test Team",
        id_manager: managerId,
        id_timetable: timetableId,
      });
      teamId = team.id;
    });

    it("permet à un admin de mettre à jour n'importe quel timetable", async () => {
      const res = await request(app)
        .put(`/timetables/${timetableId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          Shift_start: "08:00",
          Shift_end: "16:00",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.Shift_start).toBe("08:00");
      expect(res.body.Shift_end).toBe("16:00");
    });

    it("permet au manager de l'équipe de mettre à jour le timetable", async () => {
      const res = await request(app)
        .put(`/timetables/${timetableId}`)
        .set("Authorization", `Bearer ${managerToken}`)
        .send({
          Shift_start: "07:00",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.Shift_start).toBe("07:00");
      expect(res.body.Shift_end).toBe("16:00");
    });

    it("interdit à un employee de mettre à jour un timetable", async () => {
      const res = await request(app)
        .put(`/timetables/${timetableId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          Shift_start: "09:00",
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("Forbidden");
    });

    it("rejette une mise à jour si Shift_start >= Shift_end", async () => {
      const res = await request(app)
        .put(`/timetables/${timetableId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          Shift_start: "18:00",
          Shift_end: "16:00",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Shift_start must be before Shift_end");
    });

    it("retourne 404 pour un timetable inexistant", async () => {
      const res = await request(app)
        .put("/timetables/99999")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          Shift_start: "09:00",
          Shift_end: "17:00",
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Timetable not found");
    });

    it("interdit à un manager de modifier un timetable d'une autre équipe", async () => {
      // Créer un autre timetable non associé à ce manager
      const otherTimetable = await db.Timetable.create({
        Shift_start: "12:00",
        Shift_end: "20:00",
      });

      const res = await request(app)
        .put(`/timetables/${otherTimetable.id}`)
        .set("Authorization", `Bearer ${managerToken}`)
        .send({
          Shift_start: "13:00",
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("Forbidden");
    });

    it("rejette la requête sans token d'authentification", async () => {
      const res = await request(app).put(`/timetables/${timetableId}`).send({
        Shift_start: "09:00",
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe("DELETE /timetables/:id", () => {
    it("permet à un admin de supprimer n'importe quel timetable", async () => {
      // Créer un nouveau timetable pour le supprimer
      const createRes = await request(app)
        .post("/timetables")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          Shift_start: "14:00",
          Shift_end: "22:00",
        });

      const idToDelete = createRes.body.id;

      const res = await request(app)
        .delete(`/timetables/${idToDelete}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Timetable deleted successfully");

      // Vérifier que le timetable n'existe plus
      const getRes = await request(app)
        .get(`/timetables/${idToDelete}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(getRes.statusCode).toBe(404);
    });

    it("permet au manager de supprimer le timetable de son équipe", async () => {
      // Créer un timetable et l'associer à une équipe du manager
      const newTimetable = await db.Timetable.create({
        Shift_start: "06:00",
        Shift_end: "14:00",
      });

      await db.Team.create({
        name: "Manager Team 2",
        id_manager: managerId,
        id_timetable: newTimetable.id,
      });

      const res = await request(app)
        .delete(`/timetables/${newTimetable.id}`)
        .set("Authorization", `Bearer ${managerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Timetable deleted successfully");
    });

    it("interdit à un employee de supprimer un timetable", async () => {
      const res = await request(app)
        .delete(`/timetables/${timetableId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("Forbidden");
    });

    it("retourne 404 pour un timetable inexistant", async () => {
      const res = await request(app)
        .delete("/timetables/99999")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Timetable not found");
    });

    it("rejette la requête sans token d'authentification", async () => {
      const res = await request(app).delete(`/timetables/${timetableId}`);

      expect(res.statusCode).toBe(401);
    });
  });
});
