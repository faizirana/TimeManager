import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../src/app.js";
import db from "../models/index.cjs";

let accessToken;

beforeAll(async () => {
  await db.sequelize.sync({ force: true });

  await db.User.destroy({ where: {} });
  const hashedPassword = "Password123!";//await bcrypt.hash("Password123!", 10);
  await db.User.create({
    name: "Admin",
    surname: "User",
    email: "admin@example.com",
    password: hashedPassword,
    mobileNumber: "0601020304",
    role: "admin",
  });

  const res = await request(app)
    .post("/auth/login")
    .send({ email: "admin@example.com", password: "Password123!" });

  accessToken = res.body.accessToken;
});

afterAll(async () => {
  await db.sequelize.close();
});

describe("User API", () => {
  it("GET /users → retourne la liste des utilisateurs", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("email");
  });

  it("GET /users/:id → retourne un utilisateur par ID", async () => {
    const user = await db.User.findOne({ where: { email: "admin@example.com" } });
    const res = await request(app)
      .get(`/users/${user.id}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(user.email);
  });

  it("POST /users → crée un nouvel utilisateur", async () => {
    const res = await request(app)
      .post("/users")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Claire",
        surname: "Durand",
        email: "claire.durand@example.com",
        password: "P@ssword123!",
        mobileNumber: "0604050607",
        role: "employee",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.email).toBe("claire.durand@example.com");
  });

  it("PUT /users/:id → met à jour un utilisateur", async () => {
    const user = await db.User.findOne({ where: { email: "claire.durand@example.com" } });
    const res = await request(app)
      .put(`/users/${user.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ surname: "Dupont-Modifié" });

    expect(res.statusCode).toBe(200);
    expect(res.body.surname).toBe("Dupont-Modifié");
  });

  it("DELETE /users/:id → supprime un utilisateur", async () => {
    const user = await db.User.findOne({ where: { email: "claire.durand@example.com" } });
    const res = await request(app)
      .delete(`/users/${user.id}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User deleted successfully");
  });
});
