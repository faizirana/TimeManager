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

describe("User API - Negative tests", () => {

  it("GET /users → should fail without token", async () => {
    const res = await request(app).get("/users");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  it("GET /users/:id → should fail with invalid token", async () => {
    const user = await db.User.findOne({ where: { email: "admin@example.com" } });
    const res = await request(app)
      .get(`/users/${user.id}`)
      .set("Authorization", "Bearer invalidtoken");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid or expired token");
  });

  it("POST /users → should fail without token", async () => {
    const res = await request(app).post("/users").send({
      name: "Claire",
      surname: "Durand",
      email: "claire.durand@example.com",
      password: "pAssword123@",
      mobileNumber: "0604050607",
      role: "employee",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  it("PUT /users/:id → should fail without token", async () => {
    const user = await db.User.findOne({ where: { email: "admin@example.com" } });
    const res = await request(app)
      .put(`/users/${user.id}`)
      .send({ surname: "Dupont" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  it("DELETE /users/:id → should fail with invalid token", async () => {
    const user = await db.User.findOne({ where: { email: "admin@example.com" } });
    const res = await request(app)
      .delete(`/users/${user.id}`)
      .set("Authorization", "Bearer invalidtoken");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid or expired token");
  });

});
