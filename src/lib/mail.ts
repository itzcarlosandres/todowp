import nodemailer, { type Transporter } from "nodemailer";
import { render } from "@react-email/render";

const smtpHost = process.env.SMTP_HOST ?? "localhost";
const smtpPort = Number(process.env.SMTP_PORT ?? 1025);
const smtpUser = process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_PASSWORD;

let _transport: Transporter | null = null;

function getTransport(): Transporter {
  if (_transport) return _transport;
  _transport = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: smtpUser && smtpPassword ? { user: smtpUser, pass: smtpPassword } : undefined,
    tls: { rejectUnauthorized: false },
  });
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

export async function sendMail({
  to,
  subject,
  html,
  text,
  replyTo,
  attachments,
}: SendMailOptions): Promise<void> {
  const transport = getTransport();
  const fromName = process.env.SMTP_FROM_NAME ?? "MarketFlow";
  const fromEmail = process.env.SMTP_FROM_EMAIL ?? "no-reply@marketflow.example";

  await transport.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: Array.isArray(to) ? to.join(", ") : to,
    subject,
    html,
    text: text ?? stripHtml(html),
    replyTo,
    attachments,
  });
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
