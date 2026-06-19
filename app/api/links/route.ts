import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/utils/slug";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { originalUrl, customSlug } = body;

    // Validasi URL
    if (!originalUrl) {
      return NextResponse.json(
        { error: "originalUrl wajib diisi" },
        { status: 400 },
      );
    }

    try {
      new URL(originalUrl); // validasi format URL
    } catch {
      return NextResponse.json(
        { error: "Format URL tidak valid" },
        { status: 400 },
      );
    }

    // Cek custom slug kalau ada
    let slug: string;
    if (customSlug) {
      const slugRegex = /^[a-zA-Z0-9-_]+$/;
      if (!slugRegex.test(customSlug)) {
        return NextResponse.json(
          { error: "Slug hanya boleh huruf, angka, dash, dan underscore" },
          { status: 400 },
        );
      }

      const existing = await prisma.link.findUnique({
        where: { slug: customSlug },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Slug sudah dipakai, coba yang lain" },
          { status: 409 },
        );
      }

      slug = customSlug;
    } else {
      slug = await generateUniqueSlug();
    }

    const link = await prisma.link.create({
      data: { slug, originalUrl },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error("[POST /api/links]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { clicks: true } },
      },
    });

    return NextResponse.json(links);
  } catch (error) {
    console.error("[GET /api/links]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
