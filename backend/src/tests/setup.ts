process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "marketly-super-secret";
process.env.JWT_EXPIRES_IN = "7d";
process.env.STRIPE_SECRET_KEY = "sk_test_change_me";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_change_me";
process.env.FRONTEND_URL = "http://localhost:3000";
process.env.API_BASE_URL = "http://localhost:4000";

import { resetPrismaMocks } from "./helpers/mockPrisma";

beforeEach(() => {
  resetPrismaMocks();
});
