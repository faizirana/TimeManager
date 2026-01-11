import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../src/app.js";
import db from "../models/index.cjs";

let accessToken;
let _cookie;
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

  accessToken = loginRes.body.accessToken;
  _cookie = loginRes.headers["set-cookie"]?.find((c) => c.startsWith("refreshToken"));
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
      expect(res.body.message).toBe("Le manager n'existe pas");
    });

    it("fails if required fields missing", async () => {
      const res = await request(app)
        .post("/teams")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Le nom et l'id_manager sont requis");
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
      expect(res.body.message).toBe("Équipe non trouvée");
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
      expect(res.body.message).toBe("Le manager n'existe pas");
    });
  });

  describe("DELETE /teams/:id", () => {
    it("deletes a team", async () => {
      const team = await db.Team.create({ name: "Team Alpha", id_manager: managerId });

      const res = await request(app)
        .delete(`/teams/${team.id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Équipe supprimée avec succès");
    });

    it("fails if team not found", async () => {
      const res = await request(app)
        .delete("/teams/999")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Équipe non trouvée");
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
      expect(res.body.message).toBe("Utilisateur ajouté à l'équipe");
    });

    it("fails if user already in team", async () => {
      const team = await db.Team.create({ name: "Team Alpha", id_manager: managerId });
      await db.TeamMember.create({ id_team: team.id, id_user: managerId });

      const res = await request(app)
        .post(`/teams/${team.id}/users`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ id_user: managerId });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("L'utilisateur est déjà dans cette équipe");
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
      expect(res.body.message).toBe("Utilisateur retiré de l'équipe");
    });

    it("fails if user not in team", async () => {
      const team = await db.Team.create({ name: "Team Alpha", id_manager: managerId });

      const res = await request(app)
        .delete(`/teams/${team.id}/users/${managerId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("L'utilisateur n'est pas dans cette équipe");
    });
  });

  describe("Multi-team membership", () => {
    it("allows a user to be in multiple teams with the same manager", async () => {
      const team1 = await db.Team.create({ name: "Team Alpha", id_manager: managerId });
      const team2 = await db.Team.create({ name: "Team Beta", id_manager: managerId });

      // Add user to first team
      const res1 = await request(app)
        .post(`/teams/${team1.id}/users`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ id_user: managerId });
      expect(res1.statusCode).toBe(201);

      // Add same user to second team with same manager
      const res2 = await request(app)
        .post(`/teams/${team2.id}/users`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ id_user: managerId });
      expect(res2.statusCode).toBe(201);

      // Verify user is in both teams
      const memberships = await db.TeamMember.findAll({
        where: { id_user: managerId },
      });
      expect(memberships.length).toBe(2);
    });

    it("allows a user to be in multiple teams with different managers", async () => {
      const hashedPassword = await bcrypt.hash("Password123!", 12);
      const manager2 = await db.User.create({
        name: "Alice",
        surname: "Smith",
        mobileNumber: "0622334455",
        email: "alice@example.com",
        password: hashedPassword,
        role: "manager",
      });

      const employee = await db.User.create({
        name: "Bob",
        surname: "Johnson",
        mobileNumber: "0633445566",
        email: "bob@example.com",
        password: hashedPassword,
        role: "employee",
      });

      const team1 = await db.Team.create({ name: "Team Alpha", id_manager: managerId });
      const team2 = await db.Team.create({ name: "Team Gamma", id_manager: manager2.id });

      // Add employee to both teams
      await request(app)
        .post(`/teams/${team1.id}/users`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ id_user: employee.id });

      // Login as manager2 to add to their team
      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: manager2.email, password: "Password123!" });

      const res = await request(app)
        .post(`/teams/${team2.id}/users`)
        .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
        .send({ id_user: employee.id });

      expect(res.statusCode).toBe(201);

      // Verify employee is in both teams
      const memberships = await db.TeamMember.findAll({
        where: { id_user: employee.id },
      });
      expect(memberships.length).toBe(2);
    });

    it("prevents duplicate membership in the same team", async () => {
      const team = await db.Team.create({ name: "Team Alpha", id_manager: managerId });
      await db.TeamMember.create({ id_team: team.id, id_user: managerId });

      const res = await request(app)
        .post(`/teams/${team.id}/users`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ id_user: managerId });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("L'utilisateur est déjà dans cette équipe");
    });
  });

  describe("Permissions and authorization", () => {
    it("allows admin to manage any team", async () => {
      const hashedPassword = await bcrypt.hash("Password123!", 12);
      const admin = await db.User.create({
        name: "Admin",
        surname: "User",
        mobileNumber: "0644556677",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
      });

      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: admin.email, password: "Password123!" });

      const team = await db.Team.create({ name: "Team Alpha", id_manager: managerId });

      // Admin can update any team
      const res = await request(app)
        .put(`/teams/${team.id}`)
        .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
        .send({ name: "Team Updated by Admin" });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe("Team Updated by Admin");
    });

    it("allows manager to manage their own team", async () => {
      const team = await db.Team.create({ name: "Team Alpha", id_manager: managerId });

      const res = await request(app)
        .put(`/teams/${team.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: "Team Updated by Manager" });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe("Team Updated by Manager");
    });

    it("prevents manager from managing another manager's team", async () => {
      const hashedPassword = await bcrypt.hash("Password123!", 12);
      const manager2 = await db.User.create({
        name: "Alice",
        surname: "Smith",
        mobileNumber: "0622334455",
        email: "alice@example.com",
        password: hashedPassword,
        role: "manager",
      });

      const team = await db.Team.create({ name: "Team Alpha", id_manager: manager2.id });

      // Try to update another manager's team
      const res = await request(app)
        .put(`/teams/${team.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: "Unauthorized Update" });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/Accès refusé/);
    });

    it("allows team member to view their team", async () => {
      const hashedPassword = await bcrypt.hash("Password123!", 12);
      const employee = await db.User.create({
        name: "Bob",
        surname: "Johnson",
        mobileNumber: "0633445566",
        email: "bob@example.com",
        password: hashedPassword,
        role: "employee",
      });

      const team = await db.Team.create({ name: "Team Alpha", id_manager: managerId });
      await db.TeamMember.create({ id_team: team.id, id_user: employee.id });

      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: employee.email, password: "Password123!" });

      const res = await request(app)
        .get(`/teams/${team.id}`)
        .set("Authorization", `Bearer ${loginRes.body.accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe("Team Alpha");
    });

    it("prevents non-member from viewing a team", async () => {
      const hashedPassword = await bcrypt.hash("Password123!", 12);
      const employee = await db.User.create({
        name: "Bob",
        surname: "Johnson",
        mobileNumber: "0633445566",
        email: "bob@example.com",
        password: hashedPassword,
        role: "employee",
      });

      const team = await db.Team.create({ name: "Team Alpha", id_manager: managerId });

      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: employee.email, password: "Password123!" });

      const res = await request(app)
        .get(`/teams/${team.id}`)
        .set("Authorization", `Bearer ${loginRes.body.accessToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/Accès refusé/);
    });

    it("prevents employee from creating teams", async () => {
      const hashedPassword = await bcrypt.hash("Password123!", 12);
      const employee = await db.User.create({
        name: "Bob",
        surname: "Johnson",
        mobileNumber: "0633445566",
        email: "bob@example.com",
        password: hashedPassword,
        role: "employee",
      });

      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: employee.email, password: "Password123!" });

      const res = await request(app)
        .post("/teams")
        .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
        .send({ name: "Unauthorized Team", id_manager: managerId });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("Forbidden");
    });
  });

  describe("Cascade delete", () => {
    it("deletes team members when team is deleted", async () => {
      const team = await db.Team.create({ name: "Team Alpha", id_manager: managerId });
      await db.TeamMember.create({ id_team: team.id, id_user: managerId });

      // Delete the team
      await request(app).delete(`/teams/${team.id}`).set("Authorization", `Bearer ${accessToken}`);

      // Verify team members are also deleted
      const memberships = await db.TeamMember.findAll({
        where: { id_team: team.id },
      });
      expect(memberships.length).toBe(0);
    });

    it("deletes team memberships when user is deleted", async () => {
      const hashedPassword = await bcrypt.hash("Password123!", 12);
      const employee = await db.User.create({
        name: "Bob",
        surname: "Johnson",
        mobileNumber: "0633445566",
        email: "bob@example.com",
        password: hashedPassword,
        role: "employee",
      });

      const team = await db.Team.create({ name: "Team Alpha", id_manager: managerId });
      await db.TeamMember.create({ id_team: team.id, id_user: employee.id });

      // Delete the user
      await db.User.destroy({ where: { id: employee.id } });

      // Verify memberships are also deleted
      const memberships = await db.TeamMember.findAll({
        where: { id_user: employee.id },
      });
      expect(memberships.length).toBe(0);
    });
  });

  describe("Manager as team member scenario", () => {
    it("allows a manager to be a member of another team", async () => {
      const hashedPassword = await bcrypt.hash("Password123!", 12);
      const manager2 = await db.User.create({
        name: "Alice",
        surname: "Smith",
        mobileNumber: "0622334455",
        email: "alice@example.com",
        password: hashedPassword,
        role: "manager",
      });

      // manager1 creates Team Alpha and manages it
      const _teamAlpha = await db.Team.create({ name: "Team Alpha", id_manager: managerId });

      // manager2 creates Team Beta and manages it
      const teamBeta = await db.Team.create({ name: "Team Beta", id_manager: manager2.id });

      // Add manager1 as a member of Team Beta (managed by manager2)
      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: manager2.email, password: "Password123!" });

      const res = await request(app)
        .post(`/teams/${teamBeta.id}/users`)
        .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
        .send({ id_user: managerId });

      expect(res.statusCode).toBe(201);

      // Verify manager1 can view Team Beta (as member)
      const viewRes = await request(app)
        .get(`/teams/${teamBeta.id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(viewRes.statusCode).toBe(200);

      // Verify manager1 CANNOT manage Team Beta (not the manager)
      const updateRes = await request(app)
        .put(`/teams/${teamBeta.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: "Unauthorized Update" });

      expect(updateRes.statusCode).toBe(403);
    });
  });
});
