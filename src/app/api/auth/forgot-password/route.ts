import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendReactEmail } from "@/lib/mail";
import { ResetPasswordEmail } from "@/emails/reset-password";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 });

    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ success: true }); // Don't reveal if email exists
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60_000);

    await db.verificationToken.create({
      data: { identifier: email.toLowerCase(), token, expires },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/reset-password?token=${token}&email=${encodeURIComponent(email.toLowerCase())}`;

    sendReactEmail(user.email!, "Restablece tu contraseña — TodoWP", ResetPasswordEmail({ name: user.name ?? "", resetUrl })).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Forgot password:", e);
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
  }
}
