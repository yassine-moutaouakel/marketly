import type { Request, Response } from "express";
import { sendSuccess } from "../lib/response";
import { paymentService } from "../services/payment.service";

export const paymentController = {
  createCheckoutSession: async (req: Request, res: Response) =>
    sendSuccess(
      res,
      await paymentService.createCheckoutSession(req.user!.id, req.body),
      "Stripe checkout session created"
    ),
  webhook: async (req: Request, res: Response) =>
    sendSuccess(
      res,
      await paymentService.handleWebhook(
        req.headers["stripe-signature"] as string | undefined,
        req.body as Buffer
      )
    )
};
