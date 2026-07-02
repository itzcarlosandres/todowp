import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CashbackConfigForm } from "@/components/cashback/cashback-config-form";

export default async function AdminCashbackPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Cashback & Recompensas</h1>
      <CashbackConfigForm />
    </>
  );
}
