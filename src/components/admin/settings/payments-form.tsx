"use client";

import { useState } from "react";
import { saveSettingsAction } from "@/app/[locale]/(admin)/admin/settings/settings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, CreditCard, Banknote, Bitcoin, Building2 } from "lucide-react";

export function PaymentsForm({ initialData }: { initialData: Record<string, string> }) {
  const [loading, setLoading] = useState(false);
  const [isPaypalEnabled, setIsPaypalEnabled] = useState(initialData.payment_paypal_active === "true");
  const [isMpEnabled, setIsMpEnabled] = useState(initialData.payment_mp_active === "true");
  const [isCoinpalEnabled, setIsCoinpalEnabled] = useState(initialData.payment_coinpal_active === "true");
  const [isManualEnabled, setIsManualEnabled] = useState(initialData.payment_manual_active === "true");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      payment_paypal_active: isPaypalEnabled.toString(),
      payment_paypal_client_id: formData.get("payment_paypal_client_id"),
      payment_paypal_secret: formData.get("payment_paypal_secret"),
      payment_mp_active: isMpEnabled.toString(),
      payment_mp_access_token: formData.get("payment_mp_access_token"),
      payment_mp_public_key: formData.get("payment_mp_public_key"),
      payment_coinpal_active: isCoinpalEnabled.toString(),
      payment_coinpal_merchant_no: formData.get("payment_coinpal_merchant_no"),
      payment_coinpal_secret: formData.get("payment_coinpal_secret"),
      payment_manual_active: isManualEnabled.toString(),
      payment_manual_instructions: formData.get("payment_manual_instructions"),
    };

    const res = await saveSettingsAction("payments", data);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Configuración de pagos guardada");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métodos de Pago</CardTitle>
        <CardDescription>
          Activa y configura las pasarelas de pago disponibles para tus clientes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* PayPal */}
          <div className="space-y-4 rounded-lg border p-4 shadow-sm bg-muted/5">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  <CreditCard className="size-4" /> PayPal
                </Label>
                <p className="text-sm text-muted-foreground">Recibe pagos internacionales con tarjeta o saldo PayPal.</p>
              </div>
              <Switch checked={isPaypalEnabled} onCheckedChange={setIsPaypalEnabled} />
            </div>
            
            <div className={`grid gap-4 md:grid-cols-2 ${!isPaypalEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="space-y-2">
                <Label>Client ID</Label>
                <Input name="payment_paypal_client_id" type="password" defaultValue={initialData.payment_paypal_client_id || ""} placeholder="..." />
              </div>
              <div className="space-y-2">
                <Label>Secret</Label>
                <Input name="payment_paypal_secret" type="password" defaultValue={initialData.payment_paypal_secret || ""} placeholder="..." />
              </div>
            </div>
          </div>

          {/* MercadoPago */}
          <div className="space-y-4 rounded-lg border p-4 shadow-sm bg-muted/5">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  <Banknote className="size-4" /> MercadoPago
                </Label>
                <p className="text-sm text-muted-foreground">Recibe pagos locales y tarjetas en LATAM.</p>
              </div>
              <Switch checked={isMpEnabled} onCheckedChange={setIsMpEnabled} />
            </div>
            
            <div className={`grid gap-4 md:grid-cols-2 ${!isMpEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="space-y-2">
                <Label>Public Key</Label>
                <Input name="payment_mp_public_key" type="password" defaultValue={initialData.payment_mp_public_key || ""} placeholder="APP_USR-..." />
              </div>
              <div className="space-y-2">
                <Label>Access Token</Label>
                <Input name="payment_mp_access_token" type="password" defaultValue={initialData.payment_mp_access_token || ""} placeholder="APP_USR-..." />
              </div>
            </div>
          </div>

          {/* Coinpal (Crypto) */}
          <div className="space-y-4 rounded-lg border p-4 shadow-sm bg-muted/5">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  <Bitcoin className="size-4" /> Coinpal (Criptomonedas)
                </Label>
                <p className="text-sm text-muted-foreground">Recibe pagos con Bitcoin, Ethereum, USDT y más mediante Coinpal.io.</p>
              </div>
              <Switch checked={isCoinpalEnabled} onCheckedChange={setIsCoinpalEnabled} />
            </div>
            
            <div className={`grid gap-4 md:grid-cols-2 ${!isCoinpalEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="space-y-2">
                <Label>Merchant No</Label>
                <Input name="payment_coinpal_merchant_no" type="password" defaultValue={initialData.payment_coinpal_merchant_no || ""} placeholder="Ej. 12345678" />
              </div>
              <div className="space-y-2">
                <Label>App Secret Key</Label>
                <Input name="payment_coinpal_secret" type="password" defaultValue={initialData.payment_coinpal_secret || ""} placeholder="Tu clave secreta..." />
              </div>
            </div>
          </div>

          {/* Manual Payments */}
          <div className="space-y-4 rounded-lg border p-4 shadow-sm bg-muted/5">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  <Building2 className="size-4" /> Pagos Manuales (Bancarios)
                </Label>
                <p className="text-sm text-muted-foreground">Permite al usuario reservar la compra y transferir manualmente.</p>
              </div>
              <Switch checked={isManualEnabled} onCheckedChange={setIsManualEnabled} />
            </div>
            
            <div className={`space-y-2 ${!isManualEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <Label>Instrucciones de Pago</Label>
              <Textarea 
                name="payment_manual_instructions" 
                defaultValue={initialData.payment_manual_instructions || ""} 
                placeholder="Realiza una transferencia a la cuenta bancaria XXXXX a nombre de XXXXX y envía el comprobante a ventas@midominio.com"
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="brand" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Guardar Configuración
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
