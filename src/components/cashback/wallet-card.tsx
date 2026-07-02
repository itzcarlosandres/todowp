"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { getUserBalance, getCashbackTransactions, getTotalEarned } from "@/modules/cashback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, ArrowDownRight, Clock } from "lucide-react";

export function WalletCard({ userId }: { userId: string }) {
  const [balance, setBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);

  useEffect(() => {
    Promise.all([getUserBalance(userId), getTotalEarned(userId)]).then(([b, t]) => {
      setBalance(b);
      setTotalEarned(t);
    });
  }, [userId]);

  return (
    <Card className="border-brand-500/20 bg-brand-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Wallet className="size-4 text-brand-500" />
          Mi Saldo Cashback
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-extrabold tracking-tight text-brand-500">${balance.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Total ganado: ${totalEarned.toFixed(2)}
        </p>
      </CardContent>
    </Card>
  );
}

const TYPE_MAP: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary"; icon: any }> = {
  EARNED: { label: "Ganado", variant: "success", icon: TrendingUp },
  SPENT: { label: "Usado", variant: "warning", icon: ArrowDownRight },
  EXPIRED: { label: "Expirado", variant: "destructive", icon: Clock },
  ADJUSTMENT: { label: "Ajuste", variant: "secondary", icon: Clock },
};

export function RewardsHistory({ userId }: { userId: string }) {
  const [txs, setTxs] = useState<any[]>([]);

  useEffect(() => {
    getCashbackTransactions(userId).then(setTxs);
  }, [userId]);

  if (txs.length === 0) return <p className="text-sm text-muted-foreground py-8 text-center">No hay movimientos todavía</p>;

  return (
    <div className="space-y-1.5">
      {txs.map((tx) => {
        const info = TYPE_MAP[tx.type as string] ?? TYPE_MAP.EARNED!;
        const Icon = info.icon;
        return (
          <div key={tx.id} className="flex items-center justify-between rounded-lg border border-border/40 p-3">
            <div className="flex items-center gap-3">
              <div className={`flex size-8 items-center justify-center rounded-lg ${tx.type === "EARNED" ? "bg-emerald-500/10" : "bg-muted"}`}>
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{tx.reference || info.label}</p>
                <p className="text-[11px] text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString("es")}</p>
              </div>
            </div>
            <Badge variant={info.variant} className="text-xs">
              {tx.type === "EARNED" ? "+" : "-"}${Number(tx.amount).toFixed(2)}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
