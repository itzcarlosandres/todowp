"use client";

import { useState, useEffect } from "react";
import { Gift } from "lucide-react";
import { calculateCashback } from "@/modules/cashback";

export function CashbackBadge({ price }: { price: number }) {
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    calculateCashback(price).then((a) => {
      if (a > 0) setAmount(a);
    });
  }, [price]);

  if (!amount) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-sm">
      <Gift className="size-4 text-emerald-500" />
      <span className="text-muted-foreground">Gana</span>
      <span className="font-bold text-emerald-500">${amount.toFixed(2)}</span>
      <span className="text-muted-foreground">en cashback con esta compra</span>
    </div>
  );
}
