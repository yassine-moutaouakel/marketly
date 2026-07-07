import request from "supertest";
import { app } from "../app";
import { mockPrisma } from "./helpers/mockPrisma";
import {
  authHeaderForRole,
  buildProduct,
  buildShop,
  buildUser
} from "./helpers/builders";

jest.mock("../config/prisma", () => ({
  prisma: require("./helpers/mockPrisma").mockPrisma
}));

describe("Admin routes", () => {
  it("returns dashboard metrics for admins", async () => {
    mockPrisma.user.count.mockResolvedValue(12);
    mockPrisma.shop.count.mockResolvedValue(3);
    mockPrisma.product.count.mockResolvedValue(18);
    mockPrisma.order.count.mockResolvedValue(7);

    const response = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", authHeaderForRole("ADMIN"));

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      userCount: 12,
      shopCount: 3,
      productCount: 18,
      orderCount: 7
    });
  });

  it("forbids non-admin access to the dashboard", async () => {
    const response = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", authHeaderForRole("SELLER"));

    expect(response.status).toBe(403);
  });

  it("updates a shop status", async () => {
    const owner = buildUser({
      id: "seller-1",
      role: "SELLER"
    });
    const shop = buildShop({
      ownerId: owner.id
    });

    mockPrisma.shop.findUnique.mockResolvedValue(shop);
    mockPrisma.shop.update.mockResolvedValue({
      ...shop,
      status: "APPROVED",
      owner,
      products: [buildProduct({}, { shop })]
    });

    const response = await request(app)
      .patch("/api/admin/shops/shop-1/status")
      .set("Authorization", authHeaderForRole("ADMIN"))
      .send({
        status: "APPROVED"
      });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("APPROVED");
  });

  it("updates a product moderation status", async () => {
    const product = buildProduct();

    mockPrisma.product.findUnique.mockResolvedValue(product);
    mockPrisma.product.update.mockResolvedValue({
      ...product,
      status: "SUSPENDED"
    });

    const response = await request(app)
      .patch("/api/admin/products/product-1/status")
      .set("Authorization", authHeaderForRole("ADMIN"))
      .send({
        status: "SUSPENDED"
      });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("SUSPENDED");
  });
});
