"use client";

import { useState } from "react";
import { saveSettingsAction } from "@/app/[locale]/(admin)/admin/settings/settings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, Send, Shield, LockKeyhole } from "lucide-react";

export function SmtpForm({ initialData }: { initialData: Record<string, any> }) {
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [security, setSecurity] = useState(initialData.smtp_security || "auto");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      smtp_host: formData.get("smtp_host") as string,
      smtp_port: formData.get("smtp_port") as string,
      smtp_user: formData.get("smtp_user") as string,
      smtp_password: formData.get("smtp_password") as string,
      smtp_from_name: formData.get("smtp_from_name") as string,
      smtp_from_email: formData.get("smtp_from_email") as string,
      smtp_security: security,
      smtp_active: formData.get("smtp_active") as string,
    };
    const res = await saveSettingsAction("smtp", data);
    setLoading(false);
    if (res.error) toast.error(res.error);
    else toast.success("Configuración SMTP guardada");
  };

  const handleTest = async () => {
    setTestLoading(true);
    const testEmail = (document.getElementById("smtp_test_email") as HTMLInputElement)?.value;
    if (!testEmail) { toast.error("Ingresa un email de prueba"); setTestLoading(false); return; }
    try {
      const res = await fetch("/api/smtp/test", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      });
      const data = await res.json();
      if (data.success) toast.success("Email de prueba enviado correctamente");
      else toast.error(data.error || "Error al enviar el email");
    } catch { toast.error("Error de conexión"); }
    setTestLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Mail className="size-5 text-brand-500" />Servidor SMTP</CardTitle>
            <CardDescription>Configura el envío de correos electrónicos. Compatible con Gmail, Outlook, SendGrid, Mailgun, etc.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smtp_host">Host SMTP *</Label>
              <Input id="smtp_host" name="smtp_host" defaultValue={initialData.smtp_host || ""} placeholder="smtp.gmail.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp_port">Puerto *</Label>
              <select
                id="smtp_port"
                name="smtp_port"
                defaultValue={initialData.smtp_port || "587"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="25">25 — SMTP (sin cifrado)</option>
                <option value="465">465 — SSL/TLS</option>
                <option value="587">587 — STARTTLS (recomendado)</option>
                <option value="2525">2525 — Alternativo</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp_user">Usuario</Label>
              <Input id="smtp_user" name="smtp_user" defaultValue={initialData.smtp_user || ""} placeholder="tu@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp_password">Contraseña / API Key</Label>
              <Input id="smtp_password" name="smtp_password" type="password" defaultValue={initialData.smtp_password || ""} placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp_from_name">Nombre remitente</Label>
              <Input id="smtp_from_name" name="smtp_from_name" defaultValue={initialData.smtp_from_name || ""} placeholder="TodoWP" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp_from_email">Email remitente *</Label>
              <Input id="smtp_from_email" name="smtp_from_email" type="email" defaultValue={initialData.smtp_from_email || ""} placeholder="no-reply@tudominio.com" required />
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
            <h4 className="mb-3 text-sm font-semibold flex items-center gap-2"><LockKeyhole className="size-4 text-amber-500" />Seguridad de conexión</h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Tipo de cifrado</Label>
                <Select value={security} onValueChange={setSecurity}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (según puerto)</SelectItem>
                    <SelectItem value="ssl">SSL/TLS (directo)</SelectItem>
                    <SelectItem value="starttls">STARTTLS (recomendado)</SelectItem>
                    <SelectItem value="none">Sin cifrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <input type="hidden" name="smtp_active" value="false" id="smtp_active_hidden" />
              <Switch defaultChecked={initialData.smtp_active !== "false"} id="smtp_active_switch" onCheckedChange={(c) => {
                (document.getElementById("smtp_active_hidden") as HTMLInputElement).value = String(c);
              }} />
              <Label className="text-sm cursor-pointer" htmlFor="smtp_active_switch">Activar envío de correos</Label>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" variant="brand" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Guardar configuración
            </Button>
          </div>
        </form>

        <div className="mt-6 rounded-xl border border-border/60 bg-muted/20 p-4">
          <p className="text-sm font-medium mb-3 flex items-center gap-2"><Send className="size-4 text-brand-500" />Enviar email de prueba</p>
          <div className="flex gap-3">
            <Input id="smtp_test_email" type="email" placeholder="tu@email.com" className="flex-1" />
            <Button variant="outline" onClick={handleTest} disabled={testLoading}>
              {testLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4 mr-2" />}
              Probar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
