import request from "supertest";
import { app } from "../app";
import { mockPrisma } from "./helpers/mockPrisma";
import { authHeaderForRole, buildProduct, buildShop, buildUser } from "./helpers/builders";

jest.mock("../config/prisma", () => ({
  prisma: require("./helpers/mockPrisma").mockPrisma
}));

const buildCart = (items: unknown[] = []) => ({
  id: "cart-1",
  userId: "buyer-1",
  createdAt: new Date(),
  updatedAt: new Date(),
  items
});

describe("Cart routes", () => {
  it("requires authentication to read the cart", async () => {
    const response = await request(app).get("/api/cart");

    expect(response.status).toBe(401);
  });

  it("adds a published product to the cart", async () => {
    const shop = buildShop({ status: "APPROVED" });
    const product = buildProduct({ id: "product-1", stock: 5, status: "PUBLISHED" }, { shop });

    mockPrisma.cart.upsert.mockResolvedValue(buildCart());
    mockPrisma.product.findUnique.mockResolvedValue({ ...product, shop });
    mockPrisma.cartItem.findUnique.mockResolvedValue(null);
    mockPrisma.cartItem.upsert.mockResolvedValue({
      id: "cart-item-1",
      cartId: "cart-1",
      productId: product.id,
      quantity: 2
    });
    mockPrisma.cart.findUnique.mockResolvedValue(
      buildCart([
        {
          id: "cart-item-1",
          cartId: "cart-1",
          productId: product.id,
          quantity: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          product: { ...product, images: [], shop }
        }
      ])
    );

    const response = await request(app)
      .post("/api/cart/items")
      .set("Authorization", authHeaderForRole("BUYER", { id: "buyer-1" }))
      .send({ productId: "product-1", quantity: 2 });

    expect(response.status).toBe(200);
    expect(mockPrisma.cartItem.upsert).toHaveBeenCalled();
  });

  it("refuses to add a product that is not published", async () => {
    const shop = buildShop({ status: "APPROVED" });
    const product = buildProduct({ id: "product-1", status: "DRAFT" }, { shop });

    mockPrisma.cart.upsert.mockResolvedValue(buildCart());
    mockPrisma.product.findUnique.mockResolvedValue({ ...product, shop });

    const response = await request(app)
      .post("/api/cart/items")
      .set("Authorization", authHeaderForRole("BUYER", { id: "buyer-1" }))
      .send({ productId: "product-1", quantity: 1 });

    expect(response.status).toBe(400);
    expect(mockPrisma.cartItem.upsert).not.toHaveBeenCalled();
  });

  it("refuses a quantity greater than the available stock", async () => {
    const shop = buildShop({ status: "APPROVED" });
    const product = buildProduct({ id: "product-1", stock: 2, status: "PUBLISHED" }, { shop });

    mockPrisma.cart.upsert.mockResolvedValue(buildCart());
    mockPrisma.product.findUnique.mockResolvedValue({ ...product, shop });
    mockPrisma.cartItem.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/cart/items")
      .set("Authorization", authHeaderForRole("BUYER", { id: "buyer-1" }))
      .send({ productId: "product-1", quantity: 5 });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/stock/i);
    expect(mockPrisma.cartItem.upsert).not.toHaveBeenCalled();
  });

  it("rejects an invalid quantity payload", async () => {
    const response = await request(app)
      .post("/api/cart/items")
      .set("Authorization", authHeaderForRole("BUYER", { id: "buyer-1" }))
      .send({ productId: "product-1", quantity: 0 });

    expect(response.status).toBe(400);
  });
});

describe("Shop routes", () => {
  it("forbids a buyer from creating a shop", async () => {
    const response = await request(app)
      .post("/api/shops")
      .set("Authorization", authHeaderForRole("BUYER"))
      .send({ name: "Boutique test", description: "Une description de boutique valide" });

    expect(response.status).toBe(403);
    expect(mockPrisma.shop.create).not.toHaveBeenCalled();
  });

  it("creates a shop in PENDING status for a seller", async () => {
    mockPrisma.shop.findUnique.mockResolvedValue(null);
    mockPrisma.shop.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      ...buildShop({ ...(data as object), status: "PENDING" } as never),
      owner: buildUser({ id: "seller-1", role: "SELLER" })
    }));

    const response = await request(app)
      .post("/api/shops")
      .set("Authorization", authHeaderForRole("SELLER", { id: "seller-1" }))
      .send({ name: "Studio Marketly", description: "Une description de boutique valide" });

    expect(response.status).toBe(201);
    expect(mockPrisma.shop.create.mock.calls[0][0].data.status).toBe("PENDING");
    expect(mockPrisma.shop.create.mock.calls[0][0].data.ownerId).toBe("seller-1");
  });

  it("prevents a seller from owning two shops", async () => {
    mockPrisma.shop.findUnique.mockResolvedValue(buildShop({ ownerId: "seller-1" }));

    const response = await request(app)
      .post("/api/shops")
      .set("Authorization", authHeaderForRole("SELLER", { id: "seller-1" }))
      .send({ name: "Deuxieme boutique", description: "Une description de boutique valide" });

    expect(response.status).toBe(409);
    expect(mockPrisma.shop.create).not.toHaveBeenCalled();
  });

  it("returns 404 when the seller has no shop yet", async () => {
    mockPrisma.shop.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .get("/api/shops/me")
      .set("Authorization", authHeaderForRole("SELLER", { id: "seller-1" }));

    expect(response.status).toBe(404);
  });
});
