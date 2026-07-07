import request from "supertest";
import { app } from "../app";
import { mockPrisma } from "./helpers/mockPrisma";
import {
  authHeaderForRole,
  buildAddress,
  buildOrder,
  buildProduct,
  buildShop,
  buildUser
} from "./helpers/builders";

jest.mock("../config/prisma", () => ({
  prisma: require("./helpers/mockPrisma").mockPrisma
}));

describe("Order routes", () => {
  it("creates orders from the cart at checkout", async () => {
    const buyer = buildUser({
      id: "buyer-1"
    });
    const shop = buildShop({
      ownerId: "seller-1"
    });
    const product = buildProduct(
      {
        id: "product-1",
        stock: 10
      },
      { shop }
    );
    const createdOrder = buildOrder(
      {
        buyerId: buyer.id,
        shopId: shop.id
      },
      {
        buyer,
        shop
      }
    );

    mockPrisma.user.findUnique.mockResolvedValue({
      ...buyer,
      addresses: [buildAddress({ userId: buyer.id })]
    });
    mockPrisma.cart.findUnique.mockResolvedValue({
      id: "cart-1",
      userId: buyer.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: "cart-item-1",
          cartId: "cart-1",
          productId: product.id,
          quantity: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          product
        }
      ]
    });
    mockPrisma.order.create.mockResolvedValue(createdOrder);
    mockPrisma.product.update.mockResolvedValue(product);
    mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });

    const response = await request(app)
      .post("/api/orders/checkout")
      .set("Authorization", authHeaderForRole("BUYER", { id: buyer.id }))
      .send({
        addressId: "address-1",
        notes: "Livraison le matin"
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveLength(1);
    expect(mockPrisma.order.create).toHaveBeenCalled();
    expect(mockPrisma.product.update).toHaveBeenCalled();
  });

  it("rejects checkout when the cart is empty", async () => {
    const buyer = buildUser({
      id: "buyer-1"
    });

    mockPrisma.user.findUnique.mockResolvedValue({
      ...buyer,
      addresses: [buildAddress({ userId: buyer.id })]
    });
    mockPrisma.cart.findUnique.mockResolvedValue({
      id: "cart-1",
      userId: buyer.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: []
    });

    const response = await request(app)
      .post("/api/orders/checkout")
      .set("Authorization", authHeaderForRole("BUYER", { id: buyer.id }))
      .send({
        addressId: "address-1"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/cart is empty/i);
  });

  it("lists buyer orders", async () => {
    mockPrisma.order.findMany.mockResolvedValue([buildOrder()]);

    const response = await request(app)
      .get("/api/orders/my")
      .set("Authorization", authHeaderForRole("BUYER"));

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });

  it("lets the seller update an order status", async () => {
    const shop = buildShop({
      ownerId: "seller-1"
    });

    mockPrisma.order.findUnique.mockResolvedValue(
      buildOrder({}, { shop })
    );
    mockPrisma.order.update.mockResolvedValue(
      buildOrder(
        {
          status: "SHIPPED"
        },
        { shop }
      )
    );

    const response = await request(app)
      .patch("/api/orders/order-1/status")
      .set("Authorization", authHeaderForRole("SELLER"))
      .send({
        status: "SHIPPED"
      });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("SHIPPED");
  });

  it("prevents another seller from updating an unrelated order", async () => {
    const shop = buildShop({
      ownerId: "other-seller"
    });

    mockPrisma.order.findUnique.mockResolvedValue(
      buildOrder({}, { shop })
    );

    const response = await request(app)
      .patch("/api/orders/order-1/status")
      .set("Authorization", authHeaderForRole("SELLER"))
      .send({
        status: "SHIPPED"
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/cannot update/i);
  });
});
