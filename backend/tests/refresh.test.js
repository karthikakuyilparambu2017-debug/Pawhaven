
import {jest,describe,test,expect,beforeAll,beforeEach,afterAll,} from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";


process.env.NODE_ENV = "test";
process.env.CSRF_SECRET =
  "pawhaven-test-csrf-secret-1234567890";
process.env.JWT_ACCESS_SECRET =
  "pawhaven-test-access-secret-1234567890";
process.env.JWT_REFRESH_SECRET =
  "pawhaven-test-refresh-secret-1234567890";

let app;
let User;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  await mongoose.connect(mongoServer.getUri());

  const serverModule = await import("../src/Server.js");
  app = serverModule.app ?? serverModule.default;

  const userModule = await import("../src/models/User.js");
  User = userModule.default;

  if (!app) {
    throw new Error(
      "Express app was not exported correctly from src/server.js"
    );
  }
});

beforeEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();

  if (mongoServer) {
    await mongoServer.stop();
  }
});

async function getCsrfDetails() {
  const response = await request(app).get("/api/auth/csrf-token");

  const csrfToken =
    response.body.csrfToken ??
    response.body.csrf_token ??
    response.body.token;

  const cookies = response.headers["set-cookie"] ?? [];

  const csrfCookie = cookies
    .find((cookie) => cookie.startsWith("pawhaven_csrf="))
    ?.split(";")[0];

  if (!csrfToken || !csrfCookie) {
    throw new Error(
      "Could not find the CSRF token or pawhaven_csrf cookie. " +
      "Check the /api/auth/csrf-token response."
    );
  }

  return { csrfToken, csrfCookie };
}

async function createTestUser() {
  return User.create({
    name: "Test PawHaven User",
    email: "refresh-test@example.com",
    password:
      "$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ12",
    role: "PET_OWNER",
    isActive: true,
  });
}

function createRefreshToken(user) {
  return jwt.sign(
    {
      subscriptions: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
}

describe("Refresh Token API", () => {
  test("should reject the request when the refresh token is missing", async () => {
    const { csrfToken, csrfCookie } = await getCsrfDetails();

    const response = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", csrfCookie)
      .set("x-csrf-token", csrfToken);

    expect(response.status).toBe(401);
  });

  test("should issue a new access token with a valid refresh token", async () => {
    const user = await createTestUser();
    const refreshToken = createRefreshToken(user);
    const { csrfToken, csrfCookie } = await getCsrfDetails();

    const response = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", [
        csrfCookie,
        `pawhaven_refresh_token=${refreshToken}`,
      ])
      .set("x-csrf-token", csrfToken);

    expect(response.status).toBe(200);

    const cookies = response.headers["set-cookie"] ?? [];

    expect(
      cookies.some((cookie) =>
        cookie.startsWith("pawhaven_access_token=")
      )
    ).toBe(true);
  });

  test("should reject an invalid refresh token", async () => {
    const { csrfToken, csrfCookie } = await getCsrfDetails();

    const response = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", [
        csrfCookie,
        "pawhaven_refresh_token=invalid.refresh.token",
      ])
      .set("x-csrf-token", csrfToken);

    expect(response.status).toBe(401);
  });
});
