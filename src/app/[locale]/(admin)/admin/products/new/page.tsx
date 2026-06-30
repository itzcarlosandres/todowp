import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/products/product-form";

export const metadata = {
  title: "Nuevo Producto | Panel Admin",
};

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  // Fetch data needed for the form selects
  const [categories, brands] = await Promise.all([
    db.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Agregar Producto</h1>
      </div>
      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}
