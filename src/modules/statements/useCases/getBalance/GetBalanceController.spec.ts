import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database/";

let connection: Connection;

describe("Get balance", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });
  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show balance user", async () => {
    await request(app).post("/users").send({
      name: "user name",
      email: "user3@email.com",
      password: "password",
    });

    const responseToken = await request(app).post("/sessions").send({
      email: "user3@email.com",
      password: "password",
    });

    const { token } = responseToken.body;

    await request(app)
      .post("/statements/deposit")
      .send({
        amount: 999,
        description: "deposit supertest",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    await request(app)
      .post("/statements/withdraw")
      .send({
        amount: 998,
        description: "withdraw supertest",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .get("/statements/balance")
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("balance");
    expect(response.body.balance).toEqual(1);
  });

  it("should not be able to get a balance with user non exists", async () => {
    const response = await request(app).get("/statements/balance").send().set({
      Authorization: "Bearer invalid_token",
    });

    expect(response.status).toBe(401);
  });
});
