import request from "supertest";
import createConnection from "../../../../database/";
import { app } from "../../../../app";
import { v4 as uuidv4 } from "uuid";
import { hash } from "bcryptjs";
import { Connection } from "typeorm";

let connection: Connection;

describe("Create user controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidv4();
    const password = await hash("admin", 8);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate a user", async () => {
    const user = await request(app).post("/users").send({
      name: "user name",
      email: "user@email.com",
      password: "password",
    });

    const response = await request(app).post("/sessions").send({
      email: "user@email.com",
      password: "password",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should not be able to create a user with existent email", async () => {
    const response = await request(app).post("/users").send({
      name: "user name",
      email: "user@email.com",
      password: "password",
    });

    expect(response.status).toBe(401);
  });

  it("should not be able to create a user with incorrect password", async () => {
    await request(app).post("/users").send({
      name: "user name",
      email: "user@email.com",
      password: "password",
    });

    const response = await request(app).post("/users").send({
      name: "user name",
      email: "user@email.com",
      password: "wrong_password",
    });

    expect(response.status).toBe(401);
  });
});
