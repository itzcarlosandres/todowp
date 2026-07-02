import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { BrandForm } from "../../new/brand-form";

export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const { id } = await params;
  const brand = await db.brand.findUnique({ where: { id } });
  if (!brand) notFound();

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Editar marca</h1>
      <BrandForm initialData={{ id: brand.id, name: brand.name, slug: brand.slug, description: brand.description ?? "", logo: brand.logo ?? "", website: brand.website ?? "" }} />
    </>
  );
}
