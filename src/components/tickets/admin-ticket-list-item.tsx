"use client";

import { useState } from "react";
import { updateTicketStatusAction } from "@/modules/tickets";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import type { Ticket, User } from "@prisma/client";

const STATUS_MAP = {
  OPEN: { label: "Abierto", variant: "success" as const },
  PENDING: { label: "Pendiente", variant: "warning" as const },
  RESOLVED: { label: "Resuelto", variant: "secondary" as const },
  CLOSED: { label: "Cerrado", variant: "secondary" as const },
};

const PRIORITY_MAP: Record<string, string> = {
  LOW: "text-slate-400", MEDIUM: "text-blue-400", HIGH: "text-amber-400", URGENT: "text-destructive",
};

type AdminTicket = Ticket & { user: Pick<User, "name" | "email">; messages: { id: string }[] };

export function AdminTicketListItem({ ticket }: { ticket: AdminTicket }) {
  const [currentStatus, setCurrentStatus] = useState(ticket.status);
  const status = STATUS_MAP[currentStatus] ?? STATUS_MAP.OPEN;

  const handleStatus = async (newStatus: string) => {
    const res = await updateTicketStatusAction(ticket.id, newStatus);
    if (res?.error) toast.error(res.error);
    else {
      setCurrentStatus(newStatus as typeof currentStatus);
      toast.success("Estado actualizado");
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/40 bg-card p-4 transition-all hover:border-border/60 hover:bg-accent/20">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-[11px] text-muted-foreground">#{ticket.number}</span>
          <Badge variant={status.variant} className="text-[10px]">{status.label}</Badge>
          <span className={cn("text-[10px] font-semibold", PRIORITY_MAP[ticket.priority] ?? "")}>
            {ticket.priority === "URGENT" ? "!!" : ticket.priority}
          </span>
        </div>
        <Link href={`/admin/tickets/${ticket.id}`} className="hover:text-brand-500 transition-colors">
          <p className="truncate text-sm font-semibold">{ticket.subject}</p>
        </Link>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {ticket.user.name ?? ticket.user.email} · {formatDate(ticket.createdAt)} · {ticket.messages.length} msgs
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {(["OPEN", "PENDING", "RESOLVED", "CLOSED"] as const).map((s) => (
            <DropdownMenuItem
              key={s}
              onClick={() => handleStatus(s)}
              className={currentStatus === s ? "font-bold text-brand-500" : ""}
            >
              {STATUS_MAP[s].label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
