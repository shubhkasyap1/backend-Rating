import "dotenv/config";
import bcrypt from "bcryptjs";

import prisma from "../src/config/database.js";

const seed = async () => {
  try {
    const email = "admin@storerating.com";
    const password = "Admin@12345";

    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log("✅ Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await prisma.user.create({
      data: {
        name: "System Admin",
        email,
        password: hashedPassword,
        role: "ADMIN",
        address: "Delhi, India",
      },
    });

    console.log("✅ Admin created successfully");
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔐 Password: ${password}`);
  } catch (error) {
    console.error("❌ Admin seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seed();