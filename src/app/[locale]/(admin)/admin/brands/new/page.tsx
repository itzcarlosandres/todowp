import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BrandForm } from "./brand-form";

export const metadata = {
  title: "Nueva Marca | Panel Admin",
};

export default async function NewBrandPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Agregar Nueva Marca</h1>
      </div>
      <BrandForm />
    </div>
  );
}
