import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { paymentController } from "./controllers/payment.controller";
import { openApiDocument } from "./docs/openapi";
import { asyncHandler } from "./lib/async-handler";
import { errorHandler } from "./middlewares/error-handler";
import routes from "./routes";

export const app = express();

app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(paymentController.webhook)
);

app.use(
  cors({
    origin: env.FRONTEND_URL
  })
);
app.use(helmet());
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true
  })
);
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) =>
  res.status(200).json({
    status: "ok",
    service: "marketly-backend"
  })
);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.use("/api", routes);

app.use((_req, res) =>
  res.status(404).json({
    message: "Route not found"
  })
);

app.use(errorHandler);
