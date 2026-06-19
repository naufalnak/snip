import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const link = await prisma.link.findUnique({
      where: { slug },
    });

    if (!link) {
      return NextResponse.redirect(new URL("/not-found", req.url));
    }

    // Simpan klik secara async — gak nge-block redirect
    prisma.click
      .create({
        data: {
          linkId: link.id,
          userAgent: req.headers.get("user-agent") ?? undefined,
          referrer: req.headers.get("referer") ?? undefined,
        },
      })
      .catch((err) => console.error("[Click tracking error]", err));

    return NextResponse.redirect(link.originalUrl, { status: 301 });
  } catch (error) {
    console.error("[GET /[slug]]", error);
    return NextResponse.redirect(new URL("/not-found", req.url));
  }
}
