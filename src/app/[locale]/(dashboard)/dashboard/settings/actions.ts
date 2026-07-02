"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profileUpdateSchema, passwordChangeSchema } from "@/lib/validators";
import { verify, hash } from "argon2";
import { revalidatePath } from "next/cache";
import { sendReactEmail } from "@/lib/mail";
import { PasswordChangedEmail } from "@/emails/password-changed";

export async function updateProfileAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "No autorizado" };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = profileUpdateSchema.safeParse(raw);

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Datos inválidos";
    return { error: firstError };
  }

  const { name, username, bio, image } = parsed.data;

  try {
    if (username) {
      const existing = await db.user.findUnique({ where: { username } });
      if (existing && existing.id !== session.user.id) {
        return { error: "El nombre de usuario ya está en uso" };
      }
    }

    await db.user.update({
      where: { id: session.user.id },
      data: {
        name,
        username: username || null,
        bio: bio || null,
        image: image || undefined,
      },
    });

    revalidatePath("/", "layout");
    return { success: "Perfil actualizado correctamente" };
  } catch {
    return { error: "Error al actualizar el perfil" };
  }
}

export async function changePasswordAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "No autorizado" };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = passwordChangeSchema.safeParse(raw);

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Datos inválidos";
    return { error: firstError };
  }

  const { currentPassword, newPassword } = parsed.data;

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (!user?.passwordHash) {
      return { error: "No se puede cambiar la contraseña de cuentas OAuth" };
    }

    const valid = await verify(user.passwordHash, currentPassword);
    if (!valid) {
      return { error: "La contraseña actual es incorrecta" };
    }

    const hashed = await hash(newPassword);
    await db.user.update({
      where: { id: session.user.id },
      data: { passwordHash: hashed },
    });

    sendReactEmail(session.user.email!, "Contraseña actualizada — TodoWP", PasswordChangedEmail({ name: session.user.name ?? "" })).catch(() => {});

    return { success: "Contraseña actualizada correctamente" };
  } catch {
    return { error: "Error al cambiar la contraseña" };
  }
}

export async function updateAvatarAction(url: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "No autorizado" };
  }

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: { image: url },
    });

    revalidatePath("/", "layout");
    return { success: "Avatar actualizado correctamente" };
  } catch {
    return { error: "Error al actualizar el avatar" };
  }
}

export async function toggleNotificationAction(key: string, value: boolean) {
  const session = await auth();
  if (!session?.user) {
    return { error: "No autorizado" };
  }

  const allowedKeys = ["marketingEmails", "notifyNewProducts", "notifyOffers", "notifyUpdates"];
  if (!allowedKeys.includes(key)) {
    return { error: "Preferencia no válida" };
  }

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: { [key]: value },
    });

    revalidatePath("/", "layout");
    return { success: "Preferencia actualizada" };
  } catch {
    return { error: "Error al actualizar la preferencia" };
  }
}
