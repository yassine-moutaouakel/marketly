import Stripe from "stripe";
import { PaymentStatus } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { ApiError } from "../lib/errors";
import { orderService } from "./order.service";
import { createCheckoutSessionSchema } from "../validators/payment.validators";
import type { z } from "zod";

type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>;

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20"
});

export const paymentService = {
  async createCheckoutSession(userId: string, input: CreateCheckoutSessionInput) {
    const orders = await prisma.order.findMany({
      where: {
        id: {
          in: input.orderIds
        },
        buyerId: userId,
        paymentStatus: PaymentStatus.PENDING
      },
      include: {
        items: true,
        shop: true
      }
    });

    if (orders.length !== input.orderIds.length) {
      throw new ApiError(404, "One or more orders could not be found");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: orders.flatMap((order) =>
        order.items.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: "eur",
            unit_amount: item.priceInCents,
            product_data: {
              name: item.nameSnapshot,
              images: item.imageUrlSnapshot ? [item.imageUrlSnapshot] : []
            }
          }
        }))
      ),
      success_url: `${env.FRONTEND_URL}/dashboard?payment=success`,
      cancel_url: `${env.FRONTEND_URL}/cart?payment=cancelled`,
      metadata: {
        orderIds: input.orderIds.join(",")
      }
    });

    await prisma.order.updateMany({
      where: {
        id: {
          in: input.orderIds
        }
      },
      data: {
        stripeCheckoutSessionId: session.id
      }
    });

    return {
      sessionId: session.id,
      url: session.url
    };
  },

  async handleWebhook(signature: string | undefined, payload: Buffer) {
    if (!signature) {
      throw new ApiError(400, "Missing Stripe signature");
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch {
      throw new ApiError(400, "Invalid Stripe webhook signature");
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderIds =
        session.metadata?.orderIds
          ?.split(",")
          .map((value) => value.trim())
          .filter(Boolean) || [];

      await orderService.markPaid(
        orderIds,
        session.id,
        typeof session.payment_intent === "string" ? session.payment_intent : null
      );
    }

    return { received: true, type: event.type };
  }
};
