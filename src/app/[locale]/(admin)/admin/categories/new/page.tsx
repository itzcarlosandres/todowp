import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CategoryForm } from "./category-form";

export const metadata = {
  title: "Nueva Categoría | Panel Admin",
};

export default async function NewCategoryPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Agregar Nueva Categoría</h1>
      </div>
      <CategoryForm />
    </div>
  );
}
