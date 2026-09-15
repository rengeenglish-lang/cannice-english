import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { getDatabaseUrl } from "@/server/env";

const globalDatabase = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const connectionString = getDatabaseUrl();
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }), errorFormat: "minimal" });
}

export const db = globalDatabase.prisma ?? createClient();
if (process.env.NODE_ENV !== "production") globalDatabase.prisma = db;

export type TransactionClient = Parameters<Parameters<typeof db.$transaction>[0]>[0];
