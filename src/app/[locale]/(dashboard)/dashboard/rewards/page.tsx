import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WalletCard, RewardsHistory } from "@/components/cashback/wallet-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function RewardsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Mis Recompensas</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <WalletCard userId={session.user.id} />
        </div>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Historial</CardTitle></CardHeader>
          <CardContent>
            <RewardsHistory userId={session.user.id} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
