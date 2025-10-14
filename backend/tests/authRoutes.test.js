import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../src/app.js";
import db from "../models/index.cjs";

let accessToken;
let cookie;
const plainPassword = "password123";

beforeAll(async () => {
  await db.sequelize.sync({ force: true });
});

beforeEach(async () => {
  await db.User.destroy({ where: {} });

  const user = await db.User.create({
    name: "Kevin",
    surname: "Durand",
    mobileNumber: "0611223344",
    email: "kevin@example.com",
    password: await bcrypt.hash(plainPassword, 10),
    role: "manager",
  });

  const loginRes = await request(app)
    .post("/auth/login")
    .send({ email: user.email, password: plainPassword });

  accessToken = loginRes.body.accessToken;

  cookie = loginRes.headers["set-cookie"]?.find(c => c.startsWith("refreshToken"));
});

afterAll(async () => {
  await db.sequelize.close();
});


describe("Auth API", () => {
  describe("POST /auth/login", () => {
    it("logs in successfully", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "kevin@example.com", password: plainPassword });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("fails with wrong credentials", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "kevin@example.com", password: "wrongpass" });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Invalid credentials");
    });

    it("fails if email/password missing", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "kevin@example.com" });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Email and password required");
    });
  });

  describe("POST /auth/logout", () => {
    it("logs out successfully", async () => {
      const res = await request(app)
        .post("/auth/logout")
        .set("Cookie", cookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Logout successful");
    });
  });

  describe("GET /auth/me", () => {
    it("returns current user", async () => {
      const res = await request(app)
        .get("/auth/me")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe("kevin@example.com");
      expect(res.body).toHaveProperty("id");
    });

    it("fails if token missing", async () => {
      const res = await request(app).get("/auth/me");
      expect(res.statusCode).toBe(401);
    });
  });

  describe("POST /auth/refresh", () => {
    it("refreshes token if valid", async () => {
      const res = await request(app)
        .post("/auth/refresh")
        .set("Cookie", cookie);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
    });

    it("fails if refresh token missing", async () => {
      const res = await request(app).post("/auth/refresh");
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("No token");
    });
  });
});
