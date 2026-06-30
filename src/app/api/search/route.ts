import { db } from "@/lib/db";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 8), 20);

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const products = await db.product.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { shortDescription: { contains: q, mode: "insensitive" } },
        { tags: { has: q.toLowerCase() } },
      ],
    },
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      salePrice: true,
      coverImage: true,
      rating: true,
      category: { select: { name: true, slug: true, color: true } },
      brand: { select: { name: true, slug: true } },
    },
    orderBy: [{ salesCount: "desc" }, { rating: "desc" }],
    take: limit,
  });

  return NextResponse.json({
    results: products.map((p) => ({
      ...p,
      price: Number(p.price),
      salePrice: p.salePrice ? Number(p.salePrice) : null,
    })),
  });
}
