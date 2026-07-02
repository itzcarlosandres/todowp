import nodemailer, { type Transporter } from "nodemailer";
import { render } from "@react-email/render";
import { db } from "@/lib/db";

let _transport: Transporter | null = null;
let _lastConfig = "";

async function getSmtpConfig() {
  const settings = await db.setting.findMany({ where: { group: "smtp" } });
  const config: Record<string, string> = {};
  settings.forEach((s) => { config[s.key] = s.value as string; });

  const port = Number(config.smtp_port || process.env.SMTP_PORT || 587);
  const security = config.smtp_security || "auto";

  let secure = false;
  let requireTls = false;

  switch (security) {
    case "ssl":
      secure = true;
      break;
    case "starttls":
      secure = false;
      requireTls = true;
      break;
    case "none":
      secure = false;
      break;
    case "auto":
    default:
      secure = port === 465;
      requireTls = port === 587;
      break;
  }

  return {
    host: config.smtp_host || process.env.SMTP_HOST || "localhost",
    port,
    user: config.smtp_user || process.env.SMTP_USER || "",
    pass: config.smtp_password || process.env.SMTP_PASSWORD || "",
    secure,
    requireTls,
    active: config.smtp_active !== "false",
    fromName: config.smtp_from_name || process.env.SMTP_FROM_NAME || process.env.NEXT_PUBLIC_APP_NAME || "TodoWP",
    fromEmail: config.smtp_from_email || process.env.SMTP_FROM_EMAIL || "no-reply@example.com",
  };
}

async function getTransport(): Promise<Transporter> {
  const config = await getSmtpConfig();
  const configKey = `${config.host}:${config.port}:${config.user}:${config.secure}`;

  if (_transport && _lastConfig === configKey) return _transport;

  _transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: config.requireTls,
    auth: config.user && config.pass ? { user: config.user, pass: config.pass } : undefined,
    tls: { rejectUnauthorized: false },
  });
  _lastConfig = configKey;
  return _transport;
}

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: Array<{ filename: string; content: Buffer | string; path?: string }>;
}

export async function sendMail({ to, subject, html, text, replyTo, attachments }: SendMailOptions): Promise<void> {
  const config = await getSmtpConfig();
  if (!config.active) return;

  try {
    const transport = await getTransport();
    await transport.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
      text: text ?? stripHtml(html),
      replyTo,
      attachments,
    });
  } catch (e) {
    console.error("[MAIL_ERROR]", e);
  }
}

export async function sendReactEmail(
  to: string | string[],
  subject: string,
  reactElement: React.ReactElement,
  options?: { replyTo?: string },
): Promise<void> {
  const html = await render(reactElement);
  await sendMail({ to, subject, html, replyTo: options?.replyTo });
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
