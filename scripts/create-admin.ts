import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma"; // sesuaikan path ke file prisma.ts kamu

async function main() {
  const username = process.argv[2];
  const password = process.argv[3];

  if (!username || !password) {
    console.error(
      "Usage: npx tsx scripts/create-admin.ts <username> <password>",
    );
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { username },
    update: { password: hashed },
    create: { username, password: hashed },
  });

  console.log(`✅ Admin user siap: ${user.username}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
