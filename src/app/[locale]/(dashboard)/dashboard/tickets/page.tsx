import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TicketListItem } from "@/components/tickets/ticket-list-item";
import Link from "next/link";
import { MessageSquare, Plus } from "lucide-react";

export default async function TicketsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const t = await getTranslations("tickets");

  const tickets = await db.ticket.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { messages: { select: { id: true } } },
  });

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>
        <Button variant="brand" asChild>
          <Link href="/dashboard/tickets/new"><Plus className="mr-2 size-4" />{t("newTicket")}</Link>
        </Button>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto mb-3 size-10 text-muted-foreground" />
            <p className="text-muted-foreground">{t("empty")}</p>
            <Button variant="brand" className="mt-4" asChild>
              <Link href="/dashboard/tickets/new">{t("newTicket")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tickets.map((ticket) => (
            <TicketListItem key={ticket.id} ticket={ticket} href={`/dashboard/tickets/${ticket.id}`} />
          ))}
        </div>
      )}
    </>
  );
}
