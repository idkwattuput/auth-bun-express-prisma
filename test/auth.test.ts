import { beforeEach, afterEach, describe, expect, test } from "bun:test";
import request from "supertest";
import { prisma } from "../src/database/db";
import { app } from "../src";
import { password } from "bun";

let testUser = {
  firstName: "John",
  lastName: "Doe",
  email: "johndoe@mail.com",
  password: "123johndoe",
};

beforeEach(async () => {
  await prisma.users.deleteMany();
});

afterEach(async () => {
  await prisma.users.deleteMany();
});

describe("Authentication API Test", () => {
  test("Register a new user", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(testUser);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
  });

  test("Fail to register if fields incomplete or incorrect", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ firstName: "None" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All field are required");
  });

  test("Fail to register with existing email", async () => {
    await prisma.users.create({
      data: {
        first_name: "John",
        last_name: "Doe",
        email: "johndoe@mail.com",
        password: "idontkonw",
      },
    });
    const res = await request(app).post("/api/v1/auth/register").send(testUser);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("This email already exist");
  });

  test("Login with correct credentials", async () => {
    await request(app).post("/api/v1/auth/register").send(testUser);
    const res = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  test("Fail login with wrong password", async () => {
    await request(app).post("/api/v1/auth/register").send(testUser);
    const res = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: "WrongPassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Email or password is incorrect");
  });

  test("Refresh token works", async () => {
    await request(app).post("/api/v1/auth/register").send(testUser);
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send(testUser);
    const cookie = loginRes.headers["set-cookie"];

    const res = await request(app)
      .get("/api/v1/auth/refresh")
      .set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
  });

  test("Fail to refresh token if not provided", async () => {
    const res = await request(app).post("/api/v1/auth/refresh");
    expect(res.status).toBe(401);
  });

  test("Logout removes refresh token", async () => {
    await request(app).post("/api/v1/auth/register").send(testUser);
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send(testUser);
    const cookie = loginRes.headers["set-cookie"];

    const res = await request(app)
      .get("/api/v1/auth/logout")
      .set("Cookie", cookie);
    expect(res.status).toBe(204);
  });
});
