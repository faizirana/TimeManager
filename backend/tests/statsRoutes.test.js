import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../src/app.js";
import db from "../models/index.cjs";

let adminToken;
let managerToken;

beforeAll(async () => {
  await db.sequelize.sync({ force: true });

  const hashedPassword = await bcrypt.hash("Password123!", 12);

  // Create admin user
  await db.User.create({
    id: 1,
    name: "Admin",
    surname: "User",
    email: "admin@example.com",
    password: hashedPassword,
    mobileNumber: "0601020304",
    role: "admin",
  });

  // Create manager user
  await db.User.create({
    id: 2,
    name: "Manager",
    surname: "User",
    email: "manager@example.com",
    password: hashedPassword,
    mobileNumber: "0601020305",
    role: "manager",
  });

  // Create employees
  await db.User.bulkCreate([
    {
      id: 3,
      name: "Employee1",
      surname: "Test",
      email: "emp1@example.com",
      password: hashedPassword,
      mobileNumber: "0601020306",
      role: "employee",
      id_manager: 2,
    },
    {
      id: 4,
      name: "Employee2",
      surname: "Test",
      email: "emp2@example.com",
      password: hashedPassword,
      mobileNumber: "0601020307",
      role: "employee",
      id_manager: 2,
    },
  ]);

  // Create timetables
  await db.Timetable.bulkCreate([
    { id: 1, Shift_start: "09:00", Shift_end: "17:00" },
    { id: 2, Shift_start: "14:00", Shift_end: "22:00" },
  ]);

  // Create teams
  await db.Team.bulkCreate([
    { id: 1, name: "Team Alpha", id_manager: 2, id_timetable: 1 },
    { id: 2, name: "Team Beta", id_manager: 2, id_timetable: null },
  ]);

  // Create team members
  await db.TeamMember.bulkCreate([
    { id_team: 1, id_user: 3 },
    { id_team: 1, id_user: 4 },
    { id_team: 2, id_user: 3 },
  ]);

  // Create time recordings for today
  const today = new Date();
  await db.TimeRecording.bulkCreate([
    { id_user: 3, timestamp: today, type: "Arrival" },
    { id_user: 4, timestamp: today, type: "Arrival" },
  ]);

  // Login as admin
  const adminRes = await request(app)
    .post("/auth/login")
    .send({ email: "admin@example.com", password: "Password123!" });
  adminToken = adminRes.body.accessToken;

  // Login as manager
  const managerRes = await request(app)
    .post("/auth/login")
    .send({ email: "manager@example.com", password: "Password123!" });
  managerToken = managerRes.body.accessToken;
});

afterAll(async () => {
  await db.sequelize.close();
});

describe("Stats API", () => {
  describe("GET /stats/admin", () => {
    it("should return comprehensive admin statistics", async () => {
      const res = await request(app)
        .get("/stats/admin")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("totalUsers");
      expect(res.body).toHaveProperty("totalTeams");
      expect(res.body).toHaveProperty("totalTimetables");
      expect(res.body).toHaveProperty("roles");
      expect(res.body).toHaveProperty("todayRecordings");
      expect(res.body).toHaveProperty("currentlyPresent");
      expect(res.body).toHaveProperty("teamsWithoutTimetable");
      expect(res.body).toHaveProperty("avgTeamSize");
      expect(res.body).toHaveProperty("activeManagers");
      expect(res.body).toHaveProperty("inactiveManagers");

      // Verify counts
      expect(res.body.totalUsers).toBe(4);
      expect(res.body.totalTeams).toBe(2);
      expect(res.body.totalTimetables).toBe(2);

      // Verify role distribution
      expect(res.body.roles).toEqual({
        managers: 1,
        employees: 2,
        admins: 1,
      });

      // Verify team health
      expect(res.body.teamsWithoutTimetable).toBe(1);
      expect(parseFloat(res.body.avgTeamSize)).toBeGreaterThan(0);

      // Verify managers
      expect(res.body.activeManagers).toBe(1);
      expect(res.body.inactiveManagers).toBe(0);
    });

    it("should return 401 when not authenticated", async () => {
      const res = await request(app).get("/stats/admin");

      expect(res.statusCode).toBe(401);
    });

    it("should return 403 when user is not admin", async () => {
      const res = await request(app)
        .get("/stats/admin")
        .set("Authorization", `Bearer ${managerToken}`);

      expect(res.statusCode).toBe(403);
    });

    it("should handle today's recordings correctly", async () => {
      const res = await request(app)
        .get("/stats/admin")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.todayRecordings).toBeGreaterThanOrEqual(2);
      expect(res.body.currentlyPresent).toBeGreaterThanOrEqual(0);
    });
  });
});
