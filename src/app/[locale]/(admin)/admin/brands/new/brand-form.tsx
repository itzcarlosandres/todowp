"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrandAction } from "./actions";
import { updateBrandAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface BrandFormProps {
  initialData?: { id: string; name: string; slug: string; description: string; logo: string; website: string };
}

export function BrandForm({ initialData }: BrandFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEdit = !!initialData;

  const [slug, setSlug] = useState(initialData?.slug || "");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isEdit) return;
    const value = e.target.value;
    const autoSlug = value
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(autoSlug);
  };

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

    const result = isEdit ? await updateBrandAction(initialData!.id, data) : await createBrandAction(data);
    setLoading(false);

    if (result.error) toast.error(result.error);
    else {
      toast.success(isEdit ? "Marca actualizada" : "Marca creada correctamente");
      router.push("/admin/brands");
      router.refresh();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Editar marca" : "Nueva marca"}</CardTitle>
        <CardDescription>{isEdit ? "Modifica los datos de la marca" : "Registra una nueva marca o estudio en la plataforma"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input id="name" name="name" defaultValue={initialData?.name || ""} required onChange={handleNameChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required disabled={isEdit} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" defaultValue={initialData?.description || ""} rows={2} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input id="logo" name="logo" defaultValue={initialData?.logo || ""} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" defaultValue={initialData?.website || ""} placeholder="https://..." />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="brand" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEdit ? "Guardar cambios" : "Crear marca"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/brands")}>Cancelar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
