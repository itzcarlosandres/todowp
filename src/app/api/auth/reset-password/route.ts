import { NextResponse, NextRequest } from "next/server";
import { hash } from "argon2";
import { db } from "@/lib/db";
import { sendReactEmail } from "@/lib/mail";
import { PasswordChangedEmail } from "@/emails/password-changed";

const VALID_PASSWORD = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,128}$/;

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const email = req.nextUrl.searchParams.get("email");

  if (!token || !email) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/forgot-password?error=invalid`);
  }

  const record = await db.verificationToken.findFirst({
    where: { identifier: email.toLowerCase(), token },
  });

  if (!record || record.expires < new Date()) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/forgot-password?error=expired`);
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?reset=${token}&email=${encodeURIComponent(email)}`);
}

export async function POST(req: Request) {
  try {
    const { token, email, password } = await req.json();
    if (!token || !email || !password) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    if (!VALID_PASSWORD.test(password)) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número" }, { status: 400 });
    }

    const record = await db.verificationToken.findFirst({
      where: { identifier: email.toLowerCase(), token },
    });

    if (!record || record.expires < new Date()) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 });
    }

    const passwordHash = await hash(password);

    await db.user.update({
      where: { email: email.toLowerCase() },
      data: { passwordHash },
    });

    await db.verificationToken.delete({
      where: { identifier_token: { identifier: email.toLowerCase(), token } },
    });

    const user = await db.user.findUnique({ where: { email: email.toLowerCase() }, select: { name: true } });
    sendReactEmail(email.toLowerCase(), "Contraseña actualizada — TodoWP", PasswordChangedEmail({ name: user?.name ?? "" })).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Reset password:", e);
    return NextResponse.json({ error: "Error al restablecer la contraseña" }, { status: 500 });
  }
}
