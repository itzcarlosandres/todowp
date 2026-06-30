"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategoryAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function CategoryForm() {
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
      color: formData.get("color") as string,
      order: parseInt(formData.get("order") as string, 10) || 0,
    };

    const result = await createCategoryAction(data);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Categoría creada correctamente");
      router.push("/admin/categories");
      router.refresh();
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Nueva Categoría</CardTitle>
        <CardDescription>Crea una nueva clasificación para organizar tus productos.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de Categoría</Label>
              <Input id="name" name="name" placeholder="Ej. Plugins WordPress" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input id="slug" name="slug" placeholder="Ej. plugins-wordpress" required />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" placeholder="Descripción breve..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Color Destacado (Hex)</Label>
              <Input id="color" name="color" type="text" placeholder="#7C3AED" defaultValue="#7C3AED" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Orden de aparición</Label>
              <Input id="order" name="order" type="number" defaultValue="0" min="0" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" variant="brand" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Categoría
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
