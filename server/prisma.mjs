import { PrismaClient } from "@prisma/client";

import dotenv from "dotenv";

dotenv.config();

// Create Prisma client with read replicas extension
const prismaClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const prisma = prismaClient;

export default prisma;
