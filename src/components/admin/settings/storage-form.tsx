/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { saveSettingsAction } from "@/app/[locale]/(admin)/admin/settings/settings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, CloudUpload } from "lucide-react";

export function StorageForm({ initialData }: { initialData: Record<string, any> }) {
  const [loading, setLoading] = useState(false);
  const [isR2Enabled, setIsR2Enabled] = useState(initialData.r2_enabled === "true" || initialData.r2_enabled === true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      r2_enabled: isR2Enabled.toString(),
      r2_account_id: formData.get("r2_account_id"),
      r2_access_key_id: formData.get("r2_access_key_id"),
      r2_secret_access_key: formData.get("r2_secret_access_key"),
      r2_bucket_name: formData.get("r2_bucket_name"),
    };

    const res = await saveSettingsAction("storage", data);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Configuración de almacenamiento guardada");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Almacenamiento (Cloudflare R2)</CardTitle>
        <CardDescription>
          Configura tus credenciales para subir los archivos pesados (.zip) a la nube de forma segura.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm bg-muted/10">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                <CloudUpload className="size-4" /> Activar Subidas a R2
              </Label>
              <p className="text-sm text-muted-foreground">
                Si está apagado, los archivos se guardarán localmente en el servidor.
              </p>
            </div>
            <Switch
              checked={isR2Enabled}
              onCheckedChange={setIsR2Enabled}
            />
          </div>

          <div className={`space-y-4 ${!isR2Enabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Account ID</Label>
                <Input 
                  name="r2_account_id" 
                  type="password"
                  defaultValue={initialData.r2_account_id || ""} 
                  placeholder="Ej. 1234567890abcdef1234567890abcdef"
                />
              </div>
              <div className="space-y-2">
                <Label>Bucket Name</Label>
                <Input 
                  name="r2_bucket_name" 
                  defaultValue={initialData.r2_bucket_name || ""} 
                  placeholder="Ej. marketflow-storage"
                />
              </div>
              <div className="space-y-2">
                <Label>Access Key ID</Label>
                <Input 
                  name="r2_access_key_id" 
                  type="password"
                  defaultValue={initialData.r2_access_key_id || ""} 
                  placeholder="Ej. asdf1234asdf1234asdf"
                />
              </div>
              <div className="space-y-2">
                <Label>Secret Access Key</Label>
                <Input 
                  name="r2_secret_access_key" 
                  type="password"
                  defaultValue={initialData.r2_secret_access_key || ""} 
                  placeholder="Tu clave secreta..."
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Tus credenciales se cifrarán y guardarán de forma segura en la base de datos.
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="brand" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Guardar Credenciales
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
