import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date";
import type { Ticket, User } from "@prisma/client";

const STATUS_MAP = {
  OPEN: { label: "Abierto", variant: "success" as const },
  PENDING: { label: "Pendiente", variant: "warning" as const },
  RESOLVED: { label: "Resuelto", variant: "secondary" as const },
  CLOSED: { label: "Cerrado", variant: "secondary" as const },
};

const PRIORITY_MAP: Record<string, string> = {
  LOW: "text-slate-400",
  MEDIUM: "text-blue-400",
  HIGH: "text-amber-400",
  URGENT: "text-destructive",
};

type TicketWithUser = Ticket & { user: Pick<User, "name" | "email">; messages: { id: string }[] };
type TicketWithMessages = Ticket & { messages: { id: string }[] };

export function TicketListItem({
  ticket,
  href,
  showUser = false,
}: {
  ticket: TicketWithUser | TicketWithMessages;
  href: string;
  showUser?: boolean;
}) {
  const status = STATUS_MAP[ticket.status as keyof typeof STATUS_MAP] ?? STATUS_MAP.OPEN;
  const user = "user" in ticket ? ticket.user : null;

  return (
    <Link href={href} className="block">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/40 bg-card p-4 transition-all hover:border-border/60 hover:bg-accent/20">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[11px] text-muted-foreground">#{ticket.number}</span>
            <Badge variant={status.variant} className="text-[10px]">{status.label}</Badge>
            <span className={cn("text-[10px] font-semibold", PRIORITY_MAP[ticket.priority] ?? "")}>
              {ticket.priority === "URGENT" ? "!!" : ticket.priority}
            </span>
          </div>
          <p className="truncate text-sm font-semibold">{ticket.subject}</p>
          {showUser && user && (
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {user.name ?? user.email}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[11px] text-muted-foreground">{formatDate(ticket.createdAt)}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {ticket.messages.length} {ticket.messages.length === 1 ? "mensaje" : "mensajes"}
          </p>
        </div>
      </div>
    </Link>
  );
}
