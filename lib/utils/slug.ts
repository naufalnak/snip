import { prisma } from "@/lib/prisma";

const CHARACTERS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generateSlug(length = 6): string {
  return Array.from({ length }, () =>
    CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length)),
  ).join("");
}

export async function generateUniqueSlug(): Promise<string> {
  const slug = generateSlug();

  // Pastiin slug belum kepake
  const existing = await prisma.link.findUnique({ where: { slug } });
  if (existing) return generateUniqueSlug(); // rekursif kalau bentrok

  return slug;
}
