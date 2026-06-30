import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  try {
    const settings = await prisma.setting.findMany();
    console.log("Settings found:", settings.length);
    process.exit(0);
  } catch (err) {
    console.error("Prisma Error:", err);
    process.exit(1);
  }
}

main();
