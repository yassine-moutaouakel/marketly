import request from "supertest";
import { app } from "../app";
import { hashPassword } from "../lib/password";
import { mockPrisma } from "./helpers/mockPrisma";
import { authHeaderForRole, buildUser } from "./helpers/builders";

jest.mock("../config/prisma", () => ({
  prisma: require("./helpers/mockPrisma").mockPrisma
}));

describe("Auth routes", () => {
  it("registers a new buyer", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockImplementation(async ({ data }) =>
      buildUser({
        id: "buyer-1",
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role
      })
    );

    const response = await request(app).post("/api/auth/register").send({
      email: "buyer@marketly.dev",
      password: "Buyer123!",
      firstName: "Bianca",
      lastName: "Buyer",
      role: "BUYER"
    });

    expect(response.status).toBe(201);
    expect(response.body.data.user.email).toBe("buyer@marketly.dev");
    expect(response.body.data.user.password).toBeUndefined();
    expect(response.body.data.token).toBeTruthy();
    expect(mockPrisma.user.create.mock.calls[0][0].data.password).not.toBe("Buyer123!");
  });

  it("rejects duplicate registration", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(buildUser());

    const response = await request(app).post("/api/auth/register").send({
      email: "buyer@marketly.dev",
      password: "Buyer123!",
      firstName: "Bianca",
      lastName: "Buyer",
      role: "BUYER"
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/already exists/i);
  });

  it("logs in an existing user", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(
      buildUser({
        password: await hashPassword("Buyer123!")
      })
    );

    const response = await request(app).post("/api/auth/login").send({
      email: "buyer@marketly.dev",
      password: "Buyer123!"
    });

    expect(response.status).toBe(200);
    expect(response.body.data.token).toBeTruthy();
    expect(response.body.data.user.email).toBe("buyer@marketly.dev");
  });

  it("rejects invalid credentials on login", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(
      buildUser({
        password: await hashPassword("Buyer123!")
      })
    );

    const response = await request(app).post("/api/auth/login").send({
      email: "buyer@marketly.dev",
      password: "WrongPassword123!"
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/invalid credentials/i);
  });

  it("returns the authenticated user profile", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(buildUser());

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", authHeaderForRole("BUYER"));

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe("buyer@marketly.dev");
  });
});
