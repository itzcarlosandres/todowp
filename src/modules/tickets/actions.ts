"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendMail } from "@/lib/mail";
import { z } from "zod";

const createTicketSchema = z.object({
  subject: z.string().min(3, "El asunto debe tener al menos 3 caracteres").max(200),
  body: z.string().min(10, "El mensaje debe tener al menos 10 caracteres").max(5000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  category: z.string().max(100).optional(),
});

export async function createTicketAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = createTicketSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Datos inválidos" };
  }

  const { subject, body, priority, category } = parsed.data;

  try {
    const ticket = await db.ticket.create({
      data: {
        userId: session.user.id,
        subject,
        priority,
        category: category || null,
        messages: {
          create: {
            userId: session.user.id,
            body,
          },
        },
      },
    });

    const admins = await db.user.findMany({
      where: { role: "ADMIN", status: "ACTIVE" },
      select: { email: true },
    });

    if (admins.length > 0) {
      sendMail({
        to: admins.map((a) => a.email),
        subject: `Nuevo ticket #${ticket.number}: ${subject}`,
        html: `
          <h3>Nuevo ticket de soporte</h3>
          <p><strong>Usuario:</strong> ${session.user.name ?? session.user.email}</p>
          <p><strong>Asunto:</strong> ${subject}</p>
          <p><strong>Prioridad:</strong> ${priority}</p>
          <p><strong>Mensaje:</strong></p>
          <blockquote style="background:#f5f5f5;padding:12px;border-left:3px solid #6366f1">${body}</blockquote>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/tickets/${ticket.id}">Ver ticket en el panel</a></p>
        `,
      }).catch(() => {});
    }

    revalidatePath("/dashboard/tickets");
    return { success: "Ticket creado correctamente", ticketId: ticket.id };
  } catch (error) {
    console.error("Create ticket error:", error);
    return { error: "Error al crear el ticket" };
  }
}

const replySchema = z.object({
  body: z.string().min(1, "El mensaje no puede estar vacío").max(5000),
  isStaff: z.boolean().default(false),
});

export async function replyTicketAction(ticketId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  const ticket = await db.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return { error: "Ticket no encontrado" };

  const isAdmin = session.user.role === "ADMIN";
  const isOwner = ticket.userId === session.user.id;
  if (!isAdmin && !isOwner) return { error: "No tienes permiso para responder" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = replySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Mensaje inválido" };
  }

  try {
    await db.ticketMessage.create({
      data: {
        ticketId,
        userId: session.user.id,
        body: parsed.data.body,
        isStaff: isAdmin,
      },
    });

    if (ticket.status === "CLOSED" || ticket.status === "RESOLVED") {
      await db.ticket.update({ where: { id: ticketId }, data: { status: "OPEN" } });
    }

    if (isAdmin) {
      const ticketOwner = await db.user.findUnique({
        where: { id: ticket.userId },
        select: { email: true, name: true },
      });
      if (ticketOwner) {
        sendMail({
          to: ticketOwner.email,
          subject: `Respuesta en ticket #${ticket.number}: ${ticket.subject}`,
          html: `
            <h3>Nueva respuesta en tu ticket</h3>
            <p>Hola ${ticketOwner.name ?? ""}, un administrador ha respondido a tu ticket.</p>
            <blockquote style="background:#f5f5f5;padding:12px;border-left:3px solid #6366f1">${parsed.data.body}</blockquote>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tickets/${ticketId}">Ver respuesta</a></p>
          `,
        }).catch(() => {});
      }
    }

    revalidatePath("/dashboard/tickets");
    revalidatePath("/admin/tickets");
    return { success: "Respuesta enviada" };
  } catch (error) {
    console.error("Reply ticket error:", error);
    return { error: "Error al enviar la respuesta" };
  }
}

export async function updateTicketStatusAction(ticketId: string, status: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { error: "No autorizado" };

  const valid = ["OPEN", "PENDING", "RESOLVED", "CLOSED"];
  if (!valid.includes(status)) return { error: "Estado inválido" };

  try {
    await db.ticket.update({
      where: { id: ticketId },
      data: {
        status: status as "OPEN" | "PENDING" | "RESOLVED" | "CLOSED",
        ...(status === "CLOSED" || status === "RESOLVED" ? { closedAt: new Date() } : {}),
      },
    });

    revalidatePath("/admin/tickets");
    return { success: "Estado actualizado" };
  } catch {
    return { error: "Error al actualizar el estado" };
  }
}
