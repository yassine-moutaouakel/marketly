import request from "supertest";
import { app } from "../app";
import { mockPrisma } from "./helpers/mockPrisma";
import {
  authHeaderForRole,
  buildCategory,
  buildProduct,
  buildShop
} from "./helpers/builders";

jest.mock("../config/prisma", () => ({
  prisma: require("./helpers/mockPrisma").mockPrisma
}));

describe("Product routes", () => {
  it("lists published products", async () => {
    mockPrisma.product.findMany.mockResolvedValue([buildProduct()]);

    mockPrisma.product.count.mockResolvedValue(1);

    const response = await request(app).get("/api/products");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].price).toBe(89.9);
  });

  it("paginates the catalogue and exposes pagination metadata", async () => {
    mockPrisma.product.findMany.mockResolvedValue([buildProduct()]);
    mockPrisma.product.count.mockResolvedValue(37);

    const response = await request(app).get("/api/products?page=2&limit=12");

    expect(response.status).toBe(200);
    expect(response.body.meta).toEqual({
      page: 2,
      limit: 12,
      total: 37,
      totalPages: 4
    });
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 12, take: 12 })
    );
  });

  it("rejects an out-of-range pagination limit", async () => {
    const response = await request(app).get("/api/products?limit=500");

    expect(response.status).toBe(400);
    expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
  });

  it("blocks product creation for unauthenticated users", async () => {
    const response = await request(app).post("/api/products").send({
      name: "Produit",
      description: "Description complete du produit",
      categoryId: "category-1",
      price: 49.9,
      stock: 8,
      imageUrls: ["https://example.com/product.jpg"]
    });

    expect(response.status).toBe(401);
  });

  it("creates a product for a seller", async () => {
    const shop = buildShop({
      ownerId: "seller-1"
    });
    const category = buildCategory();
    const product = buildProduct({}, { shop, category });

    mockPrisma.shop.findUnique.mockResolvedValue(shop);
    mockPrisma.category.findUnique.mockResolvedValue(category);
    mockPrisma.product.findUnique.mockResolvedValue(null);
    mockPrisma.product.create.mockResolvedValue(product);

    const response = await request(app)
      .post("/api/products")
      .set("Authorization", authHeaderForRole("SELLER"))
      .send({
        name: product.name,
        description: "Description complete du produit Marketly",
        categoryId: category.id,
        price: 89.9,
        stock: 12,
        isFeatured: true,
        imageUrls: ["https://example.com/product.jpg"]
      });

    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe(product.name);
    expect(mockPrisma.product.create).toHaveBeenCalled();
  });

  it("prevents a seller from updating another seller's product", async () => {
    mockPrisma.product.findUnique.mockResolvedValue(
      buildProduct({}, { shop: buildShop({ ownerId: "other-seller" }) })
    );

    const response = await request(app)
      .put("/api/products/product-1")
      .set("Authorization", authHeaderForRole("SELLER"))
      .send({
        name: "Produit modifie"
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/cannot manage/i);
  });

  it("deletes a seller product", async () => {
    mockPrisma.product.findUnique.mockResolvedValue(
      buildProduct({}, { shop: buildShop({ ownerId: "seller-1" }) })
    );
    mockPrisma.product.delete.mockResolvedValue({});

    const response = await request(app)
      .delete("/api/products/product-1")
      .set("Authorization", authHeaderForRole("SELLER"));

    expect(response.status).toBe(200);
    expect(response.body.data.deleted).toBe(true);
  });
});
