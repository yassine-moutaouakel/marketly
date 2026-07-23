import request from "supertest";
import { app } from "../app";
import { mockPrisma } from "./helpers/mockPrisma";
import { authHeaderForRole, buildOrder, buildShop, buildUser } from "./helpers/builders";

jest.mock("../config/prisma", () => ({
  prisma: require("./helpers/mockPrisma").mockPrisma
}));

const mockStripe = {
  sessionsCreate: jest.fn(),
  constructEvent: jest.fn()
};

jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        // Lazy delegation: the mock object is only resolved at call time,
        // which avoids the temporal dead zone caused by jest.mock hoisting.
        create: (...args: unknown[]) => mockStripe.sessionsCreate(...args)
      }
    },
    webhooks: {
      constructEvent: (...args: unknown[]) => mockStripe.constructEvent(...args)
    }
  }));
});

const buildPendingOrder = (id: string) => ({
  ...buildOrder(
    {
      id,
      buyerId: "buyer-1",
      paymentStatus: "PENDING"
    },
    {
      buyer: buildUser({ id: "buyer-1" }),
      shop: buildShop({ ownerId: "seller-1" })
    }
  ),
  items: [
    {
      id: `item-${id}`,
      orderId: id,
      productId: "product-1",
      nameSnapshot: "Sac Weekender Canvas",
      skuSnapshot: "WEEKENDER-CANVAS",
      imageUrlSnapshot: "https://example.com/sac.jpg",
      priceInCents: 7490,
      quantity: 2,
      createdAt: new Date()
    }
  ]
});

describe("Payment routes", () => {
  beforeEach(() => {
    mockStripe.sessionsCreate.mockReset();
    mockStripe.constructEvent.mockReset();
  });

  it("creates a Stripe checkout session for pending orders", async () => {
    const order = buildPendingOrder("order-1");
    mockPrisma.order.findMany.mockResolvedValue([order]);
    mockPrisma.order.updateMany.mockResolvedValue({ count: 1 });
    mockStripe.sessionsCreate.mockResolvedValue({
      id: "cs_test_123",
      url: "https://checkout.stripe.com/c/cs_test_123"
    });

    const response = await request(app)
      .post("/api/payments/checkout-session")
      .set("Authorization", authHeaderForRole("BUYER", { id: "buyer-1" }))
      .send({ orderIds: ["order-1"] });

    expect(response.status).toBe(200);
    expect(response.body.data.sessionId).toBe("cs_test_123");
    expect(response.body.data.url).toContain("checkout.stripe.com");

    const stripePayload = mockStripe.sessionsCreate.mock.calls[0][0];
    expect(stripePayload.mode).toBe("payment");
    expect(stripePayload.line_items[0].price_data.unit_amount).toBe(7490);
    expect(stripePayload.line_items[0].quantity).toBe(2);
    expect(stripePayload.metadata.orderIds).toBe("order-1");

    expect(mockPrisma.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { stripeCheckoutSessionId: "cs_test_123" }
      })
    );
  });

  it("rejects a checkout session when an order does not belong to the buyer", async () => {
    mockPrisma.order.findMany.mockResolvedValue([]);

    const response = await request(app)
      .post("/api/payments/checkout-session")
      .set("Authorization", authHeaderForRole("BUYER", { id: "buyer-1" }))
      .send({ orderIds: ["order-unknown"] });

    expect(response.status).toBe(404);
    expect(mockStripe.sessionsCreate).not.toHaveBeenCalled();
  });

  it("requires authentication to create a checkout session", async () => {
    const response = await request(app)
      .post("/api/payments/checkout-session")
      .send({ orderIds: ["order-1"] });

    expect(response.status).toBe(401);
  });

  it("marks orders as paid when the webhook signature is valid", async () => {
    mockStripe.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          payment_intent: "pi_test_456",
          metadata: { orderIds: "order-1,order-2" }
        }
      }
    });
    mockPrisma.order.updateMany.mockResolvedValue({ count: 2 });

    const response = await request(app)
      .post("/api/payments/webhook")
      .set("stripe-signature", "t=123,v1=valid")
      .set("Content-Type", "application/json")
      .send(Buffer.from(JSON.stringify({ id: "evt_test" })));

    expect(response.status).toBe(200);
    expect(response.body.data.received).toBe(true);
    expect(mockPrisma.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ["order-1", "order-2"] } },
        data: expect.objectContaining({
          status: "PAID",
          paymentStatus: "PAID",
          stripePaymentIntentId: "pi_test_456"
        })
      })
    );
  });

  it("rejects a webhook with a missing signature", async () => {
    const response = await request(app)
      .post("/api/payments/webhook")
      .set("Content-Type", "application/json")
      .send(Buffer.from("{}"));

    expect(response.status).toBe(400);
    expect(mockPrisma.order.updateMany).not.toHaveBeenCalled();
  });

  it("rejects a webhook with an invalid signature", async () => {
    mockStripe.constructEvent.mockImplementation(() => {
      throw new Error("Signature verification failed");
    });

    const response = await request(app)
      .post("/api/payments/webhook")
      .set("stripe-signature", "t=123,v1=forged")
      .set("Content-Type", "application/json")
      .send(Buffer.from("{}"));

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/signature/i);
    expect(mockPrisma.order.updateMany).not.toHaveBeenCalled();
  });
});
