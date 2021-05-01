import { response } from "express";
import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database/";

let connection: Connection;

describe("Create user", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a user", async () => {
    const response = await request(app).post("/users").send({
      name: "user name",
      email: "user@email.com",
      password: "password",
    });

    expect(response.status).toBe(201);
  });

  it("should not be able to create a new user with same email", async () => {
    await request(app).post("/users").send({
      name: "user name",
      email: "user2@email.com",
      password: "password",
    });

    const response = await request(app).post("/users").send({
      name: "user name",
      email: "user2@email.com",
      password: "password",
    });

    expect(response.status).toBe(400);
  });
});
