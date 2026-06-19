import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const clicks = await prisma.click.findMany({
      where: {
        linkId: id,
        clickedAt: { gte: sevenDaysAgo },
      },
      select: { clickedAt: true },
      orderBy: { clickedAt: "asc" },
    });

    // Group by tanggal
    const grouped: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      grouped[key] = 0;
    }

    clicks.forEach(({ clickedAt }) => {
      const key = clickedAt.toISOString().split("T")[0];
      if (key in grouped) grouped[key]++;
    });

    const data = Object.entries(grouped).map(([date, count]) => ({
      date,
      count,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/links/[id]/analytics]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
