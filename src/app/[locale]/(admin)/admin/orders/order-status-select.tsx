"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/app/[locale]/(admin)/admin/orders/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { OrderStatus } from "@prisma/client";

const statuses: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "Pendiente" },
  { value: "PROCESSING", label: "Procesando" },
  { value: "PAID", label: "Pagado" },
  { value: "FAILED", label: "Fallido" },
  { value: "REFUNDED", label: "Reembolsado" },
  { value: "CANCELLED", label: "Cancelado" },
];

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<OrderStatus>(currentStatus);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setLoading(true);
    setStatus(newStatus);
    const res = await updateOrderStatus(orderId, newStatus);
    if (res.error) {
      toast.error(res.error);
      setStatus(currentStatus); // Revert on failure
    } else {
      toast.success("Estado actualizado exitosamente");
    }
    setLoading(false);
  };

  return (
    <Select value={status} onValueChange={(val) => handleStatusChange(val as OrderStatus)} disabled={loading}>
      <SelectTrigger className={`w-[130px] h-8 text-xs font-semibold ${status === "PAID" ? "bg-success/10 text-success border-success/20" : status === "CANCELLED" || status === "FAILED" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-secondary text-secondary-foreground"}`}>
        <SelectValue placeholder="Estado" />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((s) => (
          <SelectItem key={s.value} value={s.value} className="text-xs">
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
