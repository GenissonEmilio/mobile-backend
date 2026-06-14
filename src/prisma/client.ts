import "dotenv/config";
import { PrismaClient } from "@prisma/client";

console.log("foi:" + process.env.DATABASE_URL);

export const prisma = new PrismaClient();