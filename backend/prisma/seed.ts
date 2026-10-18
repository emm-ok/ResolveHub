import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import {PrismaClient} from "@prisma/client"

import { ROLE_PERMISSIONS } from "../src/server/permissions/role-permissions";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
}

const adapter = new PrismaPg({
    connectionString,
});

const prisma = new PrismaClient({
    adapter,
});
