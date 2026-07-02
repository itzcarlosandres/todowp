import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ProductGrid } from "@/components/product/product-grid";

export default async function DashboardFavoritesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const favorites = await db.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          category: { select: { id: true, name: true, slug: true, color: true, icon: true } },
          brand: { select: { id: true, name: true, slug: true, logo: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Mis favoritos</h1>
      {favorites.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-12 text-center text-muted-foreground">
          No tienes productos favoritos
        </div>
      ) : (
        <ProductGrid products={favorites.map((f) => f.product)} cols={4} />
      )}
    </>
  );
}
