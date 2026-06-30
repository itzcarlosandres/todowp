"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrandAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function BrandForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      logo: formData.get("logo") as string,
      website: formData.get("website") as string,
    };

    const result = await createBrandAction(data);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Marca creada correctamente");
      router.push("/admin/brands");
      router.refresh();
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Nueva Marca</CardTitle>
        <CardDescription>Crea un nuevo estudio o marca para asociar productos.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Marca</Label>
              <Input id="name" name="name" placeholder="Ej. CodeForge" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL amigable)</Label>
              <Input id="slug" name="slug" placeholder="Ej. codeforge" required />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" placeholder="Breve descripción del estudio..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="logo">URL del Logo (Opcional)</Label>
              <Input id="logo" name="logo" type="url" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Sitio Web (Opcional)</Label>
              <Input id="website" name="website" type="url" placeholder="https://..." />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" variant="brand" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Marca
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
