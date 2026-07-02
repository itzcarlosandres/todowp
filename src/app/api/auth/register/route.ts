import { NextResponse } from "next/server";
import { hash } from "argon2";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { sendReactEmail } from "@/lib/mail";
import { WelcomeEmail } from "@/emails/welcome";
import { VerifyEmail } from "@/emails/verify-email";
import crypto from "crypto";

const schema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email().toLowerCase(),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anon";
    const limit = rateLimit({ key: `register:${ip}`, limit: 5, windowMs: 60 * 60_000 });
    if (!limit.success) {
      return NextResponse.json(
        { error: "Demasiados intentos. Inténtalo más tarde." },
        { status: 429 },
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) {
      return NextResponse.json({ error: "Este email ya está registrado" }, { status: 409 });
    }

    const passwordHash = await hash(parsed.data.password);
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60_000);

    const user = await db.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        role: "USER",
        status: "ACTIVE",
        emailVerified: null,
      },
    });

    await db.verificationToken.create({
      data: {
        identifier: parsed.data.email,
        token: verifyToken,
        expires,
      },
    });

    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${verifyToken}&email=${encodeURIComponent(parsed.data.email)}`;

    sendReactEmail(user.email!, "Verifica tu email — TodoWP", VerifyEmail({ name: user.name ?? "", verifyUrl })).catch(() => {});
    sendReactEmail(user.email!, "¡Bienvenido a TodoWP!", WelcomeEmail({ name: user.name ?? "" })).catch(() => {});

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Error al crear la cuenta" }, { status: 500 });
  }
}
