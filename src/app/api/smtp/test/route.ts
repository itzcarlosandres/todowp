import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 });

    const settings = await db.setting.findMany({ where: { group: "smtp" } });
    const config: Record<string, string> = {};
    settings.forEach((s) => { config[s.key] = s.value as string; });

    const host = config.smtp_host || process.env.SMTP_HOST;
    const port = Number(config.smtp_port || process.env.SMTP_PORT || 587);
    const user = config.smtp_user || process.env.SMTP_USER || "";
    const pass = config.smtp_password || process.env.SMTP_PASSWORD || "";
    const security = config.smtp_security || "auto";

    let secure = false;
    let requireTls = false;
    switch (security) {
      case "ssl": secure = true; break;
      case "starttls": requireTls = true; break;
      case "none": break;
      default: secure = port === 465; requireTls = port === 587; break;
    }

    if (!host) return NextResponse.json({ error: "Host SMTP no configurado" }, { status: 400 });

    const transport = nodemailer.createTransport({
      host,
      port,
      secure,
      requireTLS: requireTls,
      auth: user && pass ? { user, pass } : undefined,
      tls: { rejectUnauthorized: false },
    });

    const fromName = config.smtp_from_name || process.env.NEXT_PUBLIC_APP_NAME || "TodoWP";
    const fromEmail = config.smtp_from_email || process.env.SMTP_FROM_EMAIL || `no-reply@${host}`;

    await transport.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: "✅ Prueba de configuración SMTP — TodoWP",
      html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px">
        <h2 style="color:#6366f1">¡Configuración SMTP exitosa!</h2>
        <p>Si estás leyendo este correo, significa que la configuración SMTP de <strong>TodoWP</strong> funciona correctamente.</p>
        <p>Host: <code>${host}:${port}</code></p>
        <p>Desde: ${fromEmail}</p>
        <hr style="border:1px solid #eee;margin:20px 0"/>
        <p style="color:#888;font-size:12px">Este es un email automático de prueba.</p>
      </div>`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: `Error: ${error.message}` }, { status: 500 });
  }
}
