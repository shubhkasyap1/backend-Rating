import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export const connectDatabase = async () => {
  try {
    await prisma.$connect();

    console.log("✅ PostgreSQL database connected successfully");
    console.log("✅ Prisma Client connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed");
    console.error(error.message);

    process.exit(1);
  }
};

export default prisma;