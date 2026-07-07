import { prisma } from "./config/prisma";
import { env } from "./config/env";
import { app } from "./app";

const server = app.listen(env.PORT, async () => {
  await prisma.$connect();
  console.log(`Marketly API running on http://localhost:${env.PORT}`);
});

const shutdown = async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
