// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Buat admin default
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      nama: "Administrator",
      email: "admin@kpu.go.id",
      role: "admin",
    },
  });

  // Seed pengaturan durasi default
  await prisma.pengaturan.upsert({
    where: { key: "durasi_pinjam_jam" },
    update: {},
    create: {
      key: "durasi_pinjam_jam",
      value: "2",
    },
  });

  console.log("✅ Seed data berhasil!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
