import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;

describe("Show an user profile", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show an authenticated user profile", async () => {
    await request(app).post("/users").send({
      name: "user name",
      email: "user@email.com",
      password: "password",
    });

    const responseToken = await request(app).post("/sessions").send({
      email: "user@email.com",
      password: "password",
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/profile")
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    // expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body.email).toEqual("user@email.com");
  });

  it("should not be able to list a non-existent user", async () => {
    const response = await request(app).get("/profile").send().set({
      Authorization: "Bearer invalidtoken",
    });

    expect(response.status).toBe(401);
  });
});
