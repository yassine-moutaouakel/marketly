import { prisma } from "../config/prisma";

export interface ReadinessCheck {
  status: "ok" | "error";
  latencyMs: number;
  error?: string;
}

export interface ReadinessReport {
  status: "ok" | "degraded";
  service: string;
  uptimeSeconds: number;
  timestamp: string;
  checks: {
    database: ReadinessCheck;
  };
}

const checkDatabase = async (): Promise<ReadinessCheck> => {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "ok", latencyMs: Date.now() - start };
  } catch (error) {
    return {
      status: "error",
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : "unknown error"
    };
  }
};

export const buildReadinessReport = async (): Promise<ReadinessReport> => {
  const database = await checkDatabase();
  const status = database.status === "ok" ? "ok" : "degraded";

  return {
    status,
    service: "marketly-backend",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    checks: { database }
  };
};
