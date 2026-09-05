import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { env } from "../config/env.js";

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined;
// };

export const prisma =
  // globalForPrisma.prisma ||
  new PrismaClient({
    adapter: new PrismaNeon({
      connectionString: env.DATABASE_URL,
    }),
    log: ["error"],
  });

// if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;