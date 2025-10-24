import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../src/app.js";
import db from "../models/index.cjs";

let accessToken;
let cookie;

beforeAll(async () => {
  await db.sequelize.sync({ force: true });
});

beforeEach(async () => {
  await db.User.destroy({ where: {} });
  
  // Pour les tests, on crée l'utilisateur avec un hash pré-calculé
  // pour simuler ce qui serait déjà en DB
  const hashedPassword = await bcrypt.hash("Password123!", 12);
  const user = await db.User.create({
    name: "Kevin",
    surname: "Durand",
    mobileNumber: "0611223344",
    email: "kevin@example.com",
    password: hashedPassword, // Hash pré-calculé (le hook ne le re-hashera pas)
    role: "manager",
  });
  
  //console.log('Test user created:', user.email);
  //console.log('Attempting to login');
  
  // Login avec le mot de passe EN CLAIR (comme le frontend le ferait)
  const loginRes = await request(app)
    .post("/auth/login")
    .send({ email: user.email, password: "Password123!" });
  
  //console.log('Login response:', loginRes.status, loginRes.body, loginRes.headers);
  accessToken = loginRes.body.accessToken;
  cookie = loginRes.headers["set-cookie"]?.find(c => c.startsWith("refreshToken"));
});

afterAll(async () => {
  await db.sequelize.close();
});

describe("Auth API", () => {
  describe("POST /auth/login", () => {
    it("logs in successfully", async () => {
      // Envoie le mot de passe en CLAIR
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "kevin@example.com", password: "Password123!" });
      
      //console.log('Login test response:', res.status, res.body, res.headers);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.headers["set-cookie"]).toBeDefined();
    });
    
    it("fails with wrong credentials", async () => {
      // Envoie un mauvais mot de passe en CLAIR
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