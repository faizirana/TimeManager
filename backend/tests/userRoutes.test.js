import request from "supertest";
import app from "../src/app.js";
import db from "../models/index.cjs";

beforeAll(async () => {
  await db.sequelize.sync({ force: true });
});

afterAll(async () => {
  await db.sequelize.close();
});

describe("User API", () => {
  beforeEach(async () => {
    await db.User.destroy({ where: {} });

    await db.User.bulkCreate([
      {
        name: "Alice",
        surname: "Martin",
        mobileNumber: "0601020304",
        email: "alice.martin@example.com",
        password: "password123",
        role: "manager",
      },
      {
        name: "Bob",
        surname: "Dupont",
        mobileNumber: "0605060708",
        email: "bob.dupont@example.com",
        password: "password456",
        role: "employee",
      },
    ]);
  });

  it("GET /users → retourne la liste des utilisateurs", async () => {
    const res = await request(app).get("/users");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty("email");
  });

  it("GET /users/:id → retourne un utilisateur par ID", async () => {
    const user = await db.User.findOne({ where: { email: "alice.martin@example.com" } });
    const res = await request(app).get(`/users/${user.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(user.email);
  });

  it("POST /users → crée un nouvel utilisateur", async () => {
    const res = await request(app)
      .post("/users")
      .send({
        name: "Claire",
        surname: "Durand",
        mobileNumber: "0611223344",
        email: "claire.durand@example.com",
        password: "secure123",
        role: "employee",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.email).toBe("claire.durand@example.com");
  });

  it("PUT /users/:id → met à jour un utilisateur", async () => {
    const user = await db.User.findOne({ where: { email: "bob.dupont@example.com" } });
    const res = await request(app)
      .put(`/users/${user.id}`)
      .send({ surname: "Dupont-Modifié" });

    expect(res.statusCode).toBe(200);
    expect(res.body.surname).toBe("Dupont-Modifié");
  });

  it("DELETE /users/:id → supprime un utilisateur", async () => {
    const claire = await db.User.create({
      name: "Claire",
      surname: "Durand",
      mobileNumber: "0611223344",
      email: "claire.durand@example.com",
      password: "secure123",
      role: "employee",
    });

    const res = await request(app).delete(`/users/${claire.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User deleted successfully");
  });
});
