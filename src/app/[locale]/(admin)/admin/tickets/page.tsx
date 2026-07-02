import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AdminTicketListItem } from "@/components/tickets/admin-ticket-list-item";
import { TicketCategoriesForm } from "@/components/admin/settings/ticket-categories-form";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { unstable_cache } from "next/cache";

const getTicketSettings = unstable_cache(
  async () => {
    const cats = await db.setting.findUnique({ where: { key: "ticket_categories" } });
    return { ticket_categories: cats?.value ?? [] };
  },
  ["admin-ticket-settings"],
  { revalidate: 60 }
);

export default async function AdminTicketsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const [settings, tickets] = await Promise.all([
    getTicketSettings(),
    db.ticket.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        messages: { select: { id: true } },
      },
    }),
  ]);

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Tickets de soporte</h1>

      <details className="mb-6">
        <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
          Gestionar categorías
        </summary>
        <div className="mt-3">
          <TicketCategoriesForm initialData={settings} />
        </div>
      </details>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto mb-3 size-10 text-muted-foreground" />
            <p className="text-muted-foreground">No hay tickets todavía</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tickets.map((ticket) => (
            <AdminTicketListItem key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </>
  );
}
