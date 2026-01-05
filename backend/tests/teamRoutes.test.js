import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../src/app.js";
import db from "../models/index.cjs";

let accessToken;
let cookie;
let managerId;

beforeAll(async () => {
  await db.sequelize.sync({ force: true });
});

beforeEach(async () => {
  // Add delay to avoid rate limiting in tests
  await new Promise((resolve) => setTimeout(resolve, 100));

  await db.TeamMember.destroy({ where: {} });
  await db.Team.destroy({ where: {} });
  await db.User.destroy({ where: {} });

  const hashedPassword = await bcrypt.hash("Password123!", 12);
  const user = await db.User.create({
    name: "Kevin",
    surname: "Durand",
    mobileNumber: "0611223344",
    email: "kevin@example.com",
    password: hashedPassword,
    role: "manager",
  });

  managerId = user.id;

  const loginRes = await request(app)
    .post("/auth/login")
    .send({ email: user.email, password: "Password123!" });

  expect(loginRes.statusCode).toBe(200);
  accessToken = loginRes.body.accessToken;
  cookie = loginRes.headers["set-cookie"]?.find((c) => c.startsWith("refreshToken"));
});

afterEach(async () => {
  await db.TeamMember.destroy({ where: {} });
  await db.Team.destroy({ where: {} });
  await db.User.destroy({ where: {} });
});

afterAll(async () => {
  await db.sequelize.close();
});

describe("Teams API", () => {
  describe("POST /teams", () => {
    it("creates a new team", async () => {
      const res = await request(app)
        .post("/teams")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: "Team Alpha", id_manager: managerId });

      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe("Team Alpha");
      expect(res.body.id_manager).toBe(managerId);
    });

    it("fails if manager does not exist", async () => {
      const res = await request(app)
        .post("/teams")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: "Team Beta", id_manager: 999 });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Manager does not exist");
    });

    it("fails if required fields missing", async () => {
      const res = await request(app)
        .post("/teams")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("name and id_manager are required");
    });
  });

  describe("GET /teams", () => {
    it("lists all teams", async () => {
      await db.Team.create({ name: "Team Alpha", id_manager: managerId });

      const res = await request(app).get("/teams").set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe("Team Alpha");
    });

    it("filters teams by user", async () => {
      const team = await db.Team.create({ name: "Team Alpha", id_manager: managerId });
      await db.TeamMember.create({ id_team: team.id, id_user: managerId });

      const res = await request(app)
        .get(`/teams?id_user=${managerId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe(team.id);
    });
  });

  describe("GET /teams/:id", () => {
    it("retrieves a team by ID", async () => {
      const team = await db.Team.create({ name: "Team Alpha", id_manager: managerId });

      const res = await request(app)
        .get(`/teams/${team.id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe("Team Alpha");
    });

    it("fails if team not found", async () => {
      const res = await request(app)
        .get("/teams/999")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Team not found");
    });
  });

  describe("PUT /teams/:id", () => {
    it("updates team name", async () => {
      const team = await db.Team.create({ name: "Team Alpha", id_manager: managerId });

      const res = await request(app)
        .put(`/teams/${team.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: "Team Beta" });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe("Team Beta");
    });

    it("fails if manager invalid", async () => {
      const team = await db.Team.create({ name: "Team Alpha", id_manager: managerId });

      const res = await request(app)
        .put(`/teams/${team.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ id_manager: 999 });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Manager does not exist");
    });
  });

  describe("DELETE /teams/:id", () => {
    it("deletes a team", async () => {
      const team = await db.Team.create({ name: "Team Alpha", id_manager: managerId });

      const res = await request(app)
        .delete(`/teams/${team.id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Team deleted successfully");
    });

    it("fails if team not found", async () => {
      const res = await request(app)
        .delete("/teams/999")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Team not found");
    });
  });

  describe("POST /teams/:id/users", () => {
    it("adds a user to a team", async () => {
      const team = await db.Team.create({ name: "Team Alpha", id_manager: managerId });

      const res = await request(app)
        .post(`/teams/${team.id}/users`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ id_user: managerId });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("User added to team");
    });

    it("fails if user already in team", async () => {
      const team = await db.Team.create({ name: "Team Alpha", id_manager: managerId });
      await db.TeamMember.create({ id_team: team.id, id_user: managerId });

      const res = await request(app)
        .post(`/teams/${team.id}/users`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ id_user: managerId });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("User already in this team");
    });
  });

  describe("DELETE /teams/:id/users/:userId", () => {
    it("removes a user from a team", async () => {
      const team = await db.Team.create({ name: "Team Alpha", id_manager: managerId });
      await db.TeamMember.create({ id_team: team.id, id_user: managerId });

      const res = await request(app)
        .delete(`/teams/${team.id}/users/${managerId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("User removed from team");
    });

    it("fails if user not in team", async () => {
      const team = await db.Team.create({ name: "Team Alpha", id_manager: managerId });

      const res = await request(app)
        .delete(`/teams/${team.id}/users/${managerId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("User not in this team");
    });
  });

  describe("POST /teams/validate/conflicts", () => {
    it("validates team assignments without conflict", async () => {
      const team = await db.Team.create({ name: "Team Alpha", id_manager: managerId });
      await db.TeamMember.create({ id_team: team.id, id_user: managerId });

      const res = await request(app)
        .post("/teams/validate/conflicts")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("All team assignments are valid");
    });

    it("detects conflict if user in multiple teams with same manager", async () => {
      const team1 = await db.Team.create({ name: "Team Alpha", id_manager: managerId });
      const team2 = await db.Team.create({ name: "Team Beta", id_manager: managerId });
      await db.TeamMember.create({ id_team: team1.id, id_user: managerId });
      await db.TeamMember.create({ id_team: team2.id, id_user: managerId });

      const res = await request(app)
        .post("/teams/validate/conflicts")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/conflicting teams/);
    });
  });
});
