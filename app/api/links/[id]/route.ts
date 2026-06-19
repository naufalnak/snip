import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await prisma.link.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/links/[id]]", error);
    return NextResponse.json(
      { error: "Link tidak ditemukan" },
      { status: 404 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const { slug } = await req.json();

    if (!slug) {
      return NextResponse.json({ error: "Slug wajib diisi" }, { status: 400 });
    }

    const slugRegex = /^[a-zA-Z0-9-_]+$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { error: "Slug hanya boleh huruf, angka, dash, dan underscore" },
        { status: 400 },
      );
    }

    // Cek slug udah dipakai link lain
    const existing = await prisma.link.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      return NextResponse.json(
        { error: "Slug sudah dipakai, coba yang lain" },
        { status: 409 },
      );
    }

    const updated = await prisma.link.update({
      where: { id },
      data: { slug },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/links/[id]]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
