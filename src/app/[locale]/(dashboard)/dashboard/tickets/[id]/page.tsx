import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TicketReplyForm } from "@/components/tickets/ticket-reply-form";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";

const STATUS_MAP = {
  OPEN: { label: "Abierto", variant: "success" as const },
  PENDING: { label: "Pendiente", variant: "warning" as const },
  RESOLVED: { label: "Resuelto", variant: "secondary" as const },
  CLOSED: { label: "Cerrado", variant: "secondary" as const },
};

const PRIORITY_MAP: Record<string, string> = {
  LOW: "Baja", MEDIUM: "Media", HIGH: "Alta", URGENT: "Urgente",
};

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const ticket = await db.ticket.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" }, include: { user: { select: { id: true, name: true, email: true, image: true, role: true } } } },
    },
  });

  if (!ticket) notFound();
  if (ticket.userId !== session.user.id && session.user.role !== "ADMIN") redirect("/dashboard/tickets");

  const status = STATUS_MAP[ticket.status] ?? STATUS_MAP.OPEN;

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-sm text-muted-foreground">#{ticket.number}</span>
          <Badge variant={status.variant}>{status.label}</Badge>
          <span className="text-xs text-muted-foreground">{PRIORITY_MAP[ticket.priority] ?? ticket.priority}</span>
        </div>
        <h1 className="text-2xl font-bold">{ticket.subject}</h1>
        <p className="text-xs text-muted-foreground mt-1">Creado el {formatDate(ticket.createdAt)}</p>
      </div>

      <div className="space-y-4 mb-8">
        {ticket.messages.map((msg) => {
          const isMe = msg.userId === session.user.id;
          return (
            <div key={msg.id} className={cn("flex gap-3", isMe ? "flex-row-reverse" : "")}>
              <div className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3",
                isMe ? "bg-brand-500 text-white rounded-br-md" : "bg-muted rounded-bl-md",
              )}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-semibold opacity-70">
                    {msg.isStaff ? `${msg.user.name ?? "Staff"} (Staff)` : (msg.user.name ?? msg.user.email)}
                  </span>
                  <span className="text-[10px] opacity-50">{formatDate(msg.createdAt)}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      {ticket.status !== "CLOSED" && (
        <Card>
          <CardContent className="pt-4">
            <TicketReplyForm ticketId={ticket.id} />
          </CardContent>
        </Card>
      )}
    </>
  );
}
