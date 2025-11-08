import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");
  const hashedPassword = await bcrypt.hash("123456", 10);

  //  Create Super Admin
  await prisma.users.create({
    data: {
      name: "Super Admin",
      email: "admin@example.com",
      password: hashedPassword, // 👈 Hashed password
      role: "SUPERADMIN",
      UserStatus: "ACTIVE",
    },
  });

  console.log("Seeding complete — Super Admin created!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
