/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { saveSettingsAction } from "@/app/[locale]/(admin)/admin/settings/settings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

export function AiForm({ initialData }: { initialData: Record<string, any> }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      gemini_api_key: formData.get("gemini_api_key"),
    };

    const res = await saveSettingsAction("ai", data);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Clave de API guardada correctamente");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-5 text-brand-500" /> Inteligencia Artificial
        </CardTitle>
        <CardDescription>
          Configura tus claves de API para generar descripciones y contenido automáticamente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Clave de API de Gemini (Google)</Label>
              <Input 
                name="gemini_api_key" 
                type="password"
                defaultValue={initialData.gemini_api_key || ""} 
                placeholder="AIzaSy..."
              />
              <p className="text-xs text-muted-foreground">
                Consigue tu clave en <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-brand-500 hover:underline">Google AI Studio</a>.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
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
