import { jest } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Set test environment variables before importing the app.
process.env.NODE_ENV = "test";
process.env.CSRF_SECRET = "pawhaven-test-csrf-secret-1234567890";
process.env.JWT_ACCESS_SECRET = "pawhaven-test-access-secret-1234567890";
process.env.JWT_REFRESH_SECRET = "pawhaven-test-refresh-secret-1234567890";

// Mock welcome emails so no real email is sent.
const mockSendWelcomeEmail = jest.fn().mockResolvedValue(undefined);

jest.unstable_mockModule("../src/services/emailService.js", () => ({
  sendWelcomeEmail: mockSendWelcomeEmail,
}));

// Import modules after configuring the mock.
const { default: app } = await import("../src/Server.js");
const { default: User } = await import("../src/models/User.js");
const { hashPassword, comparePassword } = await import(
  "../src/utils/password.js"
);

let mongoServer;

async function getCsrfToken(agent) {
  const response = await agent.get("/api/auth/csrf-token");

  expect(response.statusCode).toBe(200);
  expect(response.body.success).toBe(true);

  return response.body.csrfToken;
}

describe("PawHaven Authentication API", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  beforeEach(async () => {
    await User.deleteMany({});
    mockSendWelcomeEmail.mockClear();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  test("CSRF token endpoint should return a token", async () => {
    const response = await request(app).get("/api/auth/csrf-token");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.csrfToken).toBeDefined();
  });

  test("Registration should reject invalid input", async () => {
    const agent = request.agent(app);
    const csrfToken = await getCsrfToken(agent);

    const response = await agent
      .post("/api/auth/register")
      .set("x-csrf-token", csrfToken)
      .send({
        name: "A",
        email: "invalid-email",
        password: "123",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("Login should reject invalid input", async () => {
    const agent = request.agent(app);
    const csrfToken = await getCsrfToken(agent);

    const response = await agent
      .post("/api/auth/login")
      .set("x-csrf-token", csrfToken)
      .send({
        email: "invalid-email",
        password: "",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("Protected profile should reject unauthenticated requests", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test("Registration should create a pet owner and set authentication cookies", async () => {
    const agent = request.agent(app);
    const csrfToken = await getCsrfToken(agent);

    const response = await agent
      .post("/api/auth/register")
      .set("x-csrf-token", csrfToken)
      .send({
        name: "Test Owner",
        email: "testowner@example.com",
        password: "SecurePass123",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Registration successful");
    expect(response.body.user.email).toBe("testowner@example.com");
    expect(response.body.user.role).toBe("PET_OWNER");

    const savedUser = await User.findOne({
      email: "testowner@example.com",
    });

    expect(savedUser).not.toBeNull();
    expect(savedUser.password).not.toBe("SecurePass123");
    expect(await comparePassword("SecurePass123", savedUser.password)).toBe(true);

    expect(mockSendWelcomeEmail).toHaveBeenCalledTimes(1);

    const cookies = response.headers["set-cookie"] || [];

    expect(
      cookies.some((cookie) => cookie.startsWith("pawhaven_access_token="))
    ).toBe(true);

    expect(
      cookies.some((cookie) => cookie.startsWith("pawhaven_refresh_token="))
    ).toBe(true);
  });

  test("Login should authenticate an existing pet owner", async () => {
    const hashedPassword = await hashPassword("SecurePass123");

    await User.create({
      name: "Existing Owner",
      email: "existingowner@example.com",
      password: hashedPassword,
      role: "PET_OWNER",
    });

    const agent = request.agent(app);
    const csrfToken = await getCsrfToken(agent);

    const response = await agent
      .post("/api/auth/login")
      .set("x-csrf-token", csrfToken)
      .send({
        email: "existingowner@example.com",
        password: "SecurePass123",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Login successful");
    expect(response.body.user.email).toBe("existingowner@example.com");

    const cookies = response.headers["set-cookie"] || [];

    expect(
      cookies.some((cookie) => cookie.startsWith("pawhaven_access_token="))
    ).toBe(true);

    expect(
      cookies.some((cookie) => cookie.startsWith("pawhaven_refresh_token="))
    ).toBe(true);
  });
});
