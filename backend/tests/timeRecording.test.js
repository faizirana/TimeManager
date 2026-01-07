import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../src/app.js";
import db from "../models/index.cjs";

process.env.NODE_ENV = "test";

const { sequelize, TimeRecording, User, Team, TeamMember } = db;

let accessToken, _cookie;
let adminUser, managerUser, employeeUser, otherEmployeeUser;

beforeAll(async () => {
  await sequelize.sync({ force: true });
}, 10000);

beforeEach(async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Clean database
  await TimeRecording.destroy({ where: {} });
  await TeamMember.destroy({ where: {} });
  await Team.destroy({ where: {} });
  await User.destroy({ where: {} });

  // Create test users
  const hashedPassword = await bcrypt.hash("Password123!", 12);

  adminUser = await User.create({
    name: "Admin",
    surname: "User",
    email: "admin@example.com",
    password: hashedPassword,
    mobileNumber: "0601020304",
    role: "admin",
  });

  managerUser = await User.create({
    name: "Manager",
    surname: "User",
    email: "manager@example.com",
    password: hashedPassword,
    mobileNumber: "0601020305",
    role: "manager",
  });

  employeeUser = await User.create({
    name: "Employee",
    surname: "User",
    email: "employee@example.com",
    password: hashedPassword,
    mobileNumber: "0601020306",
    role: "employee",
    id_manager: managerUser.id,
  });

  otherEmployeeUser = await User.create({
    name: "Other",
    surname: "Employee",
    email: "other.employee@example.com",
    password: hashedPassword,
    mobileNumber: "0601020307",
    role: "employee",
  });

  // Create team and add employee
  const team = await Team.create({
    name: "Test Team",
    id_manager: managerUser.id,
  });

  await TeamMember.create({
    id_team: team.id,
    id_user: employeeUser.id,
  });

  // Login as admin by default
  const loginRes = await request(app)
    .post("/auth/login")
    .send({ email: adminUser.email, password: "Password123!" });

  accessToken = loginRes.body.accessToken;
  _cookie = loginRes.headers["set-cookie"]?.find((c) => c.startsWith("refreshToken"));
});

afterAll(async () => {
  await sequelize.close();
}, 10000);

describe("TimeRecording Model", () => {
  describe("Validations", () => {
    it("should create a time recording with valid data", async () => {
      const timestamp = new Date();
      const timeRecording = await TimeRecording.create({
        timestamp,
        type: "Arrival",
        id_user: employeeUser.id,
      });

      expect(timeRecording.timestamp).toEqual(timestamp);
      expect(timeRecording.type).toBe("Arrival");
      expect(timeRecording.id_user).toBe(employeeUser.id);
    });

    it("should not create a time recording without a timestamp", async () => {
      await expect(
        TimeRecording.create({
          type: "Arrival",
          id_user: employeeUser.id,
        }),
      ).rejects.toThrow("TimeRecording.timestamp cannot be null");
    });

    it("should not create a time recording without a type", async () => {
      await expect(
        TimeRecording.create({
          timestamp: new Date(),
          id_user: employeeUser.id,
        }),
      ).rejects.toThrow("TimeRecording.type cannot be null");
    });

    it("should not create a time recording with an invalid type", async () => {
      await expect(
        TimeRecording.create({
          timestamp: new Date(),
          type: "InvalidType",
          id_user: employeeUser.id,
        }),
      ).rejects.toThrow('Type must be either "Arrival" or "Departure"!');
    });

    it("should not create a time recording without an id_user", async () => {
      await expect(
        TimeRecording.create({
          timestamp: new Date(),
          type: "Arrival",
        }),
      ).rejects.toThrow("TimeRecording.id_user cannot be null");
    });
  });

  describe("Associations", () => {
    it("should associate a time recording with a user", async () => {
      const timeRecording = await TimeRecording.create({
        timestamp: new Date(),
        type: "Arrival",
        id_user: employeeUser.id,
      });

      const foundTimeRecording = await TimeRecording.findByPk(timeRecording.id, {
        include: [
          {
            model: User,
            as: "user",
          },
        ],
      });

      expect(foundTimeRecording["user"].id).toBe(employeeUser.id);
    });
  });
});

describe("TimeRecording API", () => {
  describe("POST /timerecordings", () => {
    it("should create a new time recording with valid data", async () => {
      const res = await request(app)
        .post("/timerecordings")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          timestamp: new Date().toISOString(),
          type: "Arrival",
          id_user: employeeUser.id,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.type).toBe("Arrival");
      expect(res.body.id_user).toBe(employeeUser.id);
    });

    it("should fail when timestamp is missing", async () => {
      const res = await request(app)
        .post("/timerecordings")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          type: "Arrival",
          id_user: employeeUser.id,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("required");
    });

    it("should fail when type is missing", async () => {
      const res = await request(app)
        .post("/timerecordings")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          timestamp: new Date().toISOString(),
          id_user: employeeUser.id,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("required");
    });

    it("should fail when id_user is missing", async () => {
      const res = await request(app)
        .post("/timerecordings")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          timestamp: new Date().toISOString(),
          type: "Arrival",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("required");
    });

    it("should fail when trying to create consecutive Arrivals", async () => {
      // First Arrival
      await request(app)
        .post("/timerecordings")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          timestamp: new Date().toISOString(),
          type: "Arrival",
          id_user: employeeUser.id,
        });

      // Second Arrival (should fail)
      const res = await request(app)
        .post("/timerecordings")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          timestamp: new Date().toISOString(),
          type: "Arrival",
          id_user: employeeUser.id,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Cannot clock arrival twice");
    });

    it("should fail when trying to create consecutive Departures", async () => {
      // Create Arrival and Departure first
      await request(app)
        .post("/timerecordings")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          timestamp: new Date().toISOString(),
          type: "Arrival",
          id_user: employeeUser.id,
        });

      await request(app)
        .post("/timerecordings")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          timestamp: new Date().toISOString(),
          type: "Departure",
          id_user: employeeUser.id,
        });

      // Second Departure (should fail)
      const res = await request(app)
        .post("/timerecordings")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          timestamp: new Date().toISOString(),
          type: "Departure",
          id_user: employeeUser.id,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Cannot clock departure twice");
    });

    it("should allow alternating Arrival and Departure", async () => {
      // First Arrival
      const res1 = await request(app)
        .post("/timerecordings")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          timestamp: new Date().toISOString(),
          type: "Arrival",
          id_user: employeeUser.id,
        });
      expect(res1.statusCode).toBe(201);

      // First Departure
      const res2 = await request(app)
        .post("/timerecordings")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          timestamp: new Date().toISOString(),
          type: "Departure",
          id_user: employeeUser.id,
        });
      expect(res2.statusCode).toBe(201);

      // Second Arrival
      const res3 = await request(app)
        .post("/timerecordings")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          timestamp: new Date().toISOString(),
          type: "Arrival",
          id_user: employeeUser.id,
        });
      expect(res3.statusCode).toBe(201);
    });

    it("should allow employee to create their own time recording", async () => {
      // Login as employee
      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: employeeUser.email, password: "Password123!" });

      const employeeToken = loginRes.body.accessToken;

      const res = await request(app)
        .post("/timerecordings")
        .set("Authorization", `Bearer ${employeeToken}`)
        .send({
          timestamp: new Date().toISOString(),
          type: "Arrival",
          id_user: employeeUser.id,
        });

      expect(res.statusCode).toBe(201);
    });

    it("should forbid employee from creating time recording for another user", async () => {
      // Login as employee
      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: employeeUser.email, password: "Password123!" });

      const employeeToken = loginRes.body.accessToken;

      const res = await request(app)
        .post("/timerecordings")
        .set("Authorization", `Bearer ${employeeToken}`)
        .send({
          timestamp: new Date().toISOString(),
          type: "Arrival",
          id_user: otherEmployeeUser.id,
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("Forbidden");
    });

    it("should allow manager to create time recording for team member", async () => {
      // Login as manager
      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: managerUser.email, password: "Password123!" });

      const managerToken = loginRes.body.accessToken;

      const res = await request(app)
        .post("/timerecordings")
        .set("Authorization", `Bearer ${managerToken}`)
        .send({
          timestamp: new Date().toISOString(),
          type: "Arrival",
          id_user: employeeUser.id,
        });

      expect(res.statusCode).toBe(201);
    });

    it("should forbid manager from creating time recording for non-team member", async () => {
      // Login as manager
      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: managerUser.email, password: "Password123!" });

      const managerToken = loginRes.body.accessToken;

      const res = await request(app)
        .post("/timerecordings")
        .set("Authorization", `Bearer ${managerToken}`)
        .send({
          timestamp: new Date().toISOString(),
          type: "Arrival",
          id_user: otherEmployeeUser.id,
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("outside your team");
    });
  });

  describe("GET /timerecordings", () => {
    beforeEach(async () => {
      // Create some test recordings
      await TimeRecording.create({
        timestamp: new Date("2026-01-07T09:00:00Z"),
        type: "Arrival",
        id_user: employeeUser.id,
      });

      await TimeRecording.create({
        timestamp: new Date("2026-01-07T17:00:00Z"),
        type: "Departure",
        id_user: employeeUser.id,
      });

      await TimeRecording.create({
        timestamp: new Date("2026-01-07T10:00:00Z"),
        type: "Arrival",
        id_user: otherEmployeeUser.id,
      });
    });

    it("should return all time recordings for admin", async () => {
      const res = await request(app)
        .get("/timerecordings")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(3);
    });

    it("should return only own time recordings for employee", async () => {
      // Login as employee
      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: employeeUser.email, password: "Password123!" });

      const employeeToken = loginRes.body.accessToken;

      const res = await request(app)
        .get("/timerecordings")
        .set("Authorization", `Bearer ${employeeToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.every((r) => r.id_user === employeeUser.id)).toBe(true);
    });

    it("should return team members' time recordings for manager", async () => {
      // Login as manager
      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: managerUser.email, password: "Password123!" });

      const managerToken = loginRes.body.accessToken;

      const res = await request(app)
        .get("/timerecordings")
        .set("Authorization", `Bearer ${managerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.every((r) => r.id_user === employeeUser.id)).toBe(true);
    });

    it("should filter by user ID", async () => {
      const res = await request(app)
        .get(`/timerecordings?id_user=${employeeUser.id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.every((r) => r.id_user === employeeUser.id)).toBe(true);
    });

    it("should filter by type", async () => {
      const res = await request(app)
        .get("/timerecordings?type=Arrival")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.every((r) => r.type === "Arrival")).toBe(true);
    });

    it("should include user information", async () => {
      const res = await request(app)
        .get("/timerecordings")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body[0]).toHaveProperty("user");
      expect(res.body[0].user).toHaveProperty("name");
      expect(res.body[0].user).toHaveProperty("email");
    });
  });

  describe("GET /timerecordings/:id", () => {
    let recording;

    beforeEach(async () => {
      recording = await TimeRecording.create({
        timestamp: new Date(),
        type: "Arrival",
        id_user: employeeUser.id,
      });
    });

    it("should return a time recording by ID for admin", async () => {
      const res = await request(app)
        .get(`/timerecordings/${recording.id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(recording.id);
      expect(res.body.type).toBe("Arrival");
    });

    it("should return own time recording for employee", async () => {
      // Login as employee
      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: employeeUser.email, password: "Password123!" });

      const employeeToken = loginRes.body.accessToken;

      const res = await request(app)
        .get(`/timerecordings/${recording.id}`)
        .set("Authorization", `Bearer ${employeeToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(recording.id);
    });

    it("should forbid employee from viewing another user's time recording", async () => {
      const otherRecording = await TimeRecording.create({
        timestamp: new Date(),
        type: "Arrival",
        id_user: otherEmployeeUser.id,
      });

      // Login as employee
      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: employeeUser.email, password: "Password123!" });

      const employeeToken = loginRes.body.accessToken;

      const res = await request(app)
        .get(`/timerecordings/${otherRecording.id}`)
        .set("Authorization", `Bearer ${employeeToken}`);

      expect(res.statusCode).toBe(403);
    });

    it("should return 404 when time recording does not exist", async () => {
      const res = await request(app)
        .get("/timerecordings/99999")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain("not found");
    });
  });

  describe("PUT /timerecordings/:id", () => {
    let recording;

    beforeEach(async () => {
      recording = await TimeRecording.create({
        timestamp: new Date("2026-01-07T09:00:00Z"),
        type: "Arrival",
        id_user: employeeUser.id,
      });
    });

    it("should update a time recording for admin", async () => {
      const res = await request(app)
        .put(`/timerecordings/${recording.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          timestamp: new Date("2026-01-07T09:30:00Z").toISOString(),
        });

      expect(res.statusCode).toBe(200);
      expect(new Date(res.body.timestamp).getTime()).toBe(
        new Date("2026-01-07T09:30:00Z").getTime(),
      );
    });

    it("should update a time recording for manager of team member", async () => {
      // Login as manager
      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: managerUser.email, password: "Password123!" });

      const managerToken = loginRes.body.accessToken;

      const res = await request(app)
        .put(`/timerecordings/${recording.id}`)
        .set("Authorization", `Bearer ${managerToken}`)
        .send({
          type: "Departure",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.type).toBe("Departure");
    });

    it("should forbid employee from updating time recording", async () => {
      // Login as employee
      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: employeeUser.email, password: "Password123!" });

      const employeeToken = loginRes.body.accessToken;

      const res = await request(app)
        .put(`/timerecordings/${recording.id}`)
        .set("Authorization", `Bearer ${employeeToken}`)
        .send({
          timestamp: new Date().toISOString(),
        });

      expect(res.statusCode).toBe(403);
    });

    it("should prevent updating to create consecutive duplicate types", async () => {
      // Create a departure after the arrival
      await TimeRecording.create({
        timestamp: new Date("2026-01-07T17:00:00Z"),
        type: "Departure",
        id_user: employeeUser.id,
      });

      // Try to update the first recording (Arrival) to Departure (would create consecutive Departures)
      const res = await request(app)
        .put(`/timerecordings/${recording.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          type: "Departure",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("consecutive");
    });

    it("should return 404 when time recording does not exist", async () => {
      const res = await request(app)
        .put("/timerecordings/99999")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          timestamp: new Date().toISOString(),
        });

      expect(res.statusCode).toBe(404);
    });
  });

  describe("DELETE /timerecordings/:id", () => {
    let recording;

    beforeEach(async () => {
      recording = await TimeRecording.create({
        timestamp: new Date(),
        type: "Arrival",
        id_user: employeeUser.id,
      });
    });

    it("should delete a time recording for admin", async () => {
      const res = await request(app)
        .delete(`/timerecordings/${recording.id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain("deleted successfully");

      const deleted = await TimeRecording.findByPk(recording.id);
      expect(deleted).toBeNull();
    });

    it("should delete a time recording for manager of team member", async () => {
      // Login as manager
      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: managerUser.email, password: "Password123!" });

      const managerToken = loginRes.body.accessToken;

      const res = await request(app)
        .delete(`/timerecordings/${recording.id}`)
        .set("Authorization", `Bearer ${managerToken}`);

      expect(res.statusCode).toBe(200);
    });

    it("should forbid employee from deleting time recording", async () => {
      // Login as employee
      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: employeeUser.email, password: "Password123!" });

      const employeeToken = loginRes.body.accessToken;

      const res = await request(app)
        .delete(`/timerecordings/${recording.id}`)
        .set("Authorization", `Bearer ${employeeToken}`);

      expect(res.statusCode).toBe(403);
    });

    it("should return 404 when time recording does not exist", async () => {
      const res = await request(app)
        .delete("/timerecordings/99999")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(404);
    });
  });
});
