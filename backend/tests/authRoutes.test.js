import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../src/app.js";
import db from "../models/index.cjs";

let accessToken;
let cookie;
let testUserId;

beforeAll(async () => {
  await db.sequelize.sync({ force: true });
});

beforeEach(async () => {
  // Add delay to avoid rate limiting in tests
  await new Promise((resolve) => setTimeout(resolve, 100));

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

  testUserId = user.id;

  //console.log('Test user created:', user.email);
  //console.log('Attempting to login');

  // Login avec le mot de passe EN CLAIR (comme le frontend le ferait)
  const loginRes = await request(app)
    .post("/auth/login")
    .send({ email: user.email, password: "Password123!" });

  //console.log('Login response:', loginRes.status, loginRes.body, loginRes.headers);
  accessToken = loginRes.body.accessToken;
  cookie = loginRes.headers["set-cookie"]?.find((c) => c.startsWith("refreshToken"));

  // Ensure cookie is defined before continuing
  if (!cookie && loginRes.statusCode === 200) {
    console.error("Warning: No refresh token cookie set after successful login");
  }
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
      expect(res.body.message).toBe("Identifiants invalides");
    });

    it("fails if email/password missing", async () => {
      const res = await request(app).post("/auth/login").send({ email: "kevin@example.com" });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("L'email et le mot de passe sont requis");
    });
  });

  describe("POST /auth/logout", () => {
    it("logs out successfully", async () => {
      const res = await request(app).post("/auth/logout").set("Cookie", cookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Déconnexion réussie");
    });
  });

  describe("GET /auth/me", () => {
    it("returns current user with all profile fields", async () => {
      const res = await request(app).get("/auth/me").set("Authorization", `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe("kevin@example.com");
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("name", "Kevin");
      expect(res.body).toHaveProperty("surname", "Durand");
      expect(res.body).toHaveProperty("role", "manager");
      expect(res.body).toHaveProperty("mobileNumber", "0611223344");
    });

    it("fails if token missing", async () => {
      const res = await request(app).get("/auth/me");
      expect(res.statusCode).toBe(401);
    });
  });

  describe("POST /auth/refresh", () => {
    it("refreshes token if valid", async () => {
      const res = await request(app).post("/auth/refresh").set("Cookie", cookie);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
    });

    it("fails if refresh token missing", async () => {
      const res = await request(app).post("/auth/refresh");
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Aucun token");
    });

    it("fails if refresh token was revoked", async () => {
      // D'abord logout pour révoquer le token
      await request(app).post("/auth/logout").set("Cookie", cookie);

      // Essayer de refresh avec le token révoqué
      const res = await request(app).post("/auth/refresh").set("Cookie", cookie);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("Token révoqué");
    });

    it("rotates refresh token on each refresh", async () => {
      // Premier refresh
      const res1 = await request(app).post("/auth/refresh").set("Cookie", cookie);

      expect(res1.statusCode).toBe(200);
      const newCookie = res1.headers["set-cookie"]?.find((c) => c.startsWith("refreshToken"));
      expect(newCookie).toBeDefined();

      // Extract tokens from cookies
      const oldToken = cookie.match(/refreshToken=([^;]+)/)?.[1];
      const newToken = newCookie.match(/refreshToken=([^;]+)/)?.[1];

      // Tokens should be different (rotation)
      expect(newToken).not.toBe(oldToken);

      // Deuxième refresh avec le nouveau cookie
      const res2 = await request(app).post("/auth/refresh").set("Cookie", newCookie);

      expect(res2.statusCode).toBe(200);
    });

    it("stores tokens as hash, not plaintext", async () => {
      // Extract token from cookie
      const tokenMatch = cookie.match(/refreshToken=([^;]+)/);
      const plainToken = tokenMatch ? tokenMatch[1] : null;
      expect(plainToken).toBeDefined();

      // Get user from database
      const user = await db.User.findOne({ where: { email: "kevin@example.com" } });

      // Verify token is NOT stored in plaintext
      expect(user.refreshTokenHash).toBeDefined();
      expect(user.refreshTokenHash).not.toBe(plainToken);

      // Verify hash starts with bcrypt format
      expect(user.refreshTokenHash).toMatch(/^\$2[aby]\$/);

      // Verify tokenFamily UUID is set
      expect(user.refreshTokenFamily).toBeDefined();
      expect(user.refreshTokenFamily).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it("detects token reuse and invalidates all sessions", async () => {
      // Store the initial token from login (beforeEach)
      const oldToken = cookie.split(";")[0]; // Get "refreshToken=..."
      console.log("[TEST] Initial token from login (chars 100-150):", oldToken.substring(100, 150));

      // First refresh - get new token
      const res1 = await request(app).post("/auth/refresh").set("Cookie", oldToken);

      expect(res1.statusCode).toBe(200);
      const newCookieHeader = res1.headers["set-cookie"]?.find((c) => c.startsWith("refreshToken"));
      const newToken = newCookieHeader.split(";")[0];
      console.log("[TEST] New token after refresh (chars 100-150):", newToken.substring(100, 150));

      // Wait a moment to ensure tokens have different timestamps
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Try to REUSE the OLD token from login (should detect reuse because we already used it)
      console.log(
        "[TEST] Reusing OLD token from login (chars 100-150):",
        oldToken.substring(100, 150),
      );
      const res2 = await request(app).post("/auth/refresh").set("Cookie", oldToken); // Reuse the token from login that was already refreshed

      expect(res2.statusCode).toBe(403);
      expect(res2.body.message).toContain("Réutilisation de token détectée");

      // Verify all sessions invalidated
      const user = await db.User.findOne({ where: { email: "kevin@example.com" } });
      expect(user.refreshTokenHash).toBeNull();
      expect(user.refreshTokenFamily).toBeNull();

      // Even the new token should not work anymore
      const res3 = await request(app).post("/auth/refresh").set("Cookie", newToken);

      expect(res3.statusCode).toBe(403);
    }, 15000); // Increase timeout
  });

  describe("Token revocation on password change", () => {
    it("invalidates refresh token when password is changed", async () => {
      // Changer le mot de passe
      await request(app)
        .put(`/users/${testUserId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ password: "NewPassword123!" });

      // Essayer de refresh avec l'ancien token
      const res = await request(app).post("/auth/refresh").set("Cookie", cookie);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("Token révoqué");
    });
  });

  describe("Rate limiting", () => {
    beforeEach(async () => {
      // Nettoyer pour éviter les limites de taux des tests précédents
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it("blocks excessive login attempts", async () => {
      const promises = [];
      // Faire 51 tentatives (limite en test = 50)
      for (let i = 0; i < 51; i++) {
        promises.push(
          request(app)
            .post("/auth/login")
            .send({ email: "kevin@example.com", password: "wrongpass" }),
        );
      }

      const responses = await Promise.all(promises);
      const rateLimited = responses.some((res) => res.statusCode === 429);
      expect(rateLimited).toBe(true);
    }, 300000);

    it("blocks excessive refresh attempts", async () => {
      // Wait for rate limiter window to expire (10 seconds in test mode)
      await new Promise((resolve) => setTimeout(resolve, 11000));

      // Create a dedicated user for this test to avoid rate limiting from previous test
      const hashedPassword = await bcrypt.hash("TestPass123!", 12);
      const testUser = await db.User.create({
        name: "Test",
        surname: "Refresh",
        mobileNumber: "0611223355",
        email: "test.refresh@example.com",
        password: hashedPassword,
        role: "manager",
      });

      // Login with dedicated user
      const freshLogin = await request(app)
        .post("/auth/login")
        .send({ email: testUser.email, password: "TestPass123!" });

      const freshCookie = freshLogin.headers["set-cookie"]?.find((c) =>
        c.startsWith("refreshToken"),
      );

      // Ensure we have a valid cookie before proceeding
      expect(freshLogin.statusCode).toBe(200);
      expect(freshCookie).toBeDefined();

      const promises = [];
      // Faire 51 tentatives (limite en test = 50)
      for (let i = 0; i < 51; i++) {
        promises.push(request(app).post("/auth/refresh").set("Cookie", freshCookie));
      }

      const responses = await Promise.all(promises);
      const rateLimited = responses.some((res) => res.statusCode === 429);
      expect(rateLimited).toBe(true);
    }, 60000);
  });
});
