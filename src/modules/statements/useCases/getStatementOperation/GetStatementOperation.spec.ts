import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database/";

let connection: Connection;

describe("show the specific statement operation", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });
  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show the specific statement operation", async () => {
    await request(app).post("/users").send({
      name: "user name",
      email: "user4@email.com",
      password: "password",
    });

    const responseToken = await request(app).post("/sessions").send({
      email: "user4@email.com",
      password: "password",
    });

    const { token } = responseToken.body;

    const deposit = await request(app)
      .post("/statements/deposit")
      .send({
        amount: 999,
        description: "deposit supertest",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id } = deposit.body;

    const response = await request(app)
      .get(`/statements/${id}`)
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body.type).toEqual("deposit");
  });

  it("should not be able to view a statement of a user that does not exist", async () => {
    await request(app).post("/users").send({
      name: "user name",
      email: "user5@email.com",
      password: "password",
    });

    const responseToken = await request(app).post("/sessions").send({
      email: "non-existent",
      password: "password",
    });

    const { token } = responseToken.body;

    const deposit = await request(app)
      .post("/statements/deposit")
      .send({
        amount: 800,
        description: "deposit supertest",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id } = deposit.body;

    const response = await request(app).get(`/statements/${id}`).send().set({
      Authorization: "Bearer invalid_token",
    });

    expect(response.status).toBe(401);
  });

  it("should not be able to view a non existent statement", async () => {
    await request(app).post("/users").send({
      name: "user name",
      email: "user6@email.com",
      password: "password",
    });

    const responseToken = await request(app).post("/sessions").send({
      email: "user6@email.com",
      password: "password",
    });

    const { token } = responseToken.body;

    const id = uuidV4();

    const response = await request(app)
      .get(`/statements/${id}`)
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });
});
