import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/products/product-form";

export const metadata = {
  title: "Editar Producto | Panel Admin",
};

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const [product, categories, brands] = await Promise.all([
    db.product.findUnique({
      where: { id: params.id },
      include: {
        versions: {
          where: { isLatest: true },
          take: 1
        }
      }
    }),
    db.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!product) {
    redirect("/admin/products");
  }

  // Convert Decimal to number for the client component
  const productData = {
    ...product,
    price: Number(product.price),
    fileSizeMB: product.fileSize ? product.fileSize / (1024 * 1024) : null,
    latestVersion: product.versions[0]?.version || "",
    fileName: product.versions[0]?.fileName || "",
    fileKey: product.versions[0]?.fileKey || "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Editar Producto</h1>
      </div>
      <ProductForm 
        categories={categories} 
        brands={brands} 
        initialData={productData} 
      />
    </div>
  );
}
