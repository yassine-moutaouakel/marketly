import request from "supertest";
import { app } from "../app";
import { mockPrisma, resetPrismaMocks } from "./helpers/mockPrisma";

jest.mock("../config/prisma", () => ({
  prisma: require("./helpers/mockPrisma").mockPrisma
}));

describe("Health routes", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("reports liveness without touching the database", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok", service: "marketly-backend" });
    expect(mockPrisma.$queryRaw).not.toHaveBeenCalled();
  });

  it("reports ready when the database probe succeeds", async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);

    const res = await request(app).get("/health/ready");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.checks.database.status).toBe("ok");
  });

  it("reports degraded with 503 when the database probe fails", async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error("Can't reach database server"));

    const res = await request(app).get("/health/ready");

    expect(res.status).toBe(503);
    expect(res.body.status).toBe("degraded");
    expect(res.body.checks.database.status).toBe("error");
    expect(res.body.checks.database.error).toContain("Can't reach database server");
  });
});
