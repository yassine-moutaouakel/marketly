import { prisma } from "./config/prisma";
import { env } from "./config/env";
import { app } from "./app";

const server = app.listen(env.PORT, () => {
  console.log(`Marketly API running on http://localhost:${env.PORT}`);

  prisma.$connect().catch((error) => {
    console.error("Database connection failed at startup; /health/ready will report degraded status.", error);
  });
});

const shutdown = async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
