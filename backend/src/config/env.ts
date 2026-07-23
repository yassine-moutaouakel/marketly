import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().default("postgresql://postgres:postgres@localhost:5432/marketly?schema=public"),
  JWT_SECRET: z.string().min(8).default("marketly-super-secret"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  STRIPE_SECRET_KEY: z.string().default("sk_test_change_me"),
  STRIPE_WEBHOOK_SECRET: z.string().default("whsec_change_me"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  API_BASE_URL: z.string().default("http://localhost:4000"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().default(100)
});

const parsedEnv = envSchema.parse(process.env);

/**
 * Production guard: the permissive defaults above exist to keep local
 * development and the test suite frictionless. Shipping them to production
 * would expose forgeable JWTs and a non-functional payment flow, so we fail
 * fast at boot instead (OWASP A05 - Security Misconfiguration).
 */
if (parsedEnv.NODE_ENV === "production") {
  const insecureDefaults: string[] = [];

  if (parsedEnv.JWT_SECRET === "marketly-super-secret") {
    insecureDefaults.push("JWT_SECRET");
  }

  if (parsedEnv.STRIPE_SECRET_KEY === "sk_test_change_me") {
    insecureDefaults.push("STRIPE_SECRET_KEY");
  }

  if (parsedEnv.STRIPE_WEBHOOK_SECRET === "whsec_change_me") {
    insecureDefaults.push("STRIPE_WEBHOOK_SECRET");
  }

  if (insecureDefaults.length > 0) {
    throw new Error(
      `Refusing to start in production with default values for: ${insecureDefaults.join(", ")}`
    );
  }
}

export const env = parsedEnv;
