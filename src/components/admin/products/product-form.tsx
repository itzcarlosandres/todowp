/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createProductAction } from "@/app/[locale]/(admin)/admin/products/new/actions";
import { updateProductAction } from "@/app/[locale]/(admin)/admin/products/[id]/edit/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { FileUploader } from "@/components/ui/file-uploader";

const MAX_META_DESC = 160;

const truncate = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd().replace(/\s+\S*$/, "");
};

type Category = { id: string; name: string };
type Brand = { id: string; name: string };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProductForm({ categories, brands, initialData }: { categories: any[]; brands: any[]; initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [fileKey, setFileKey] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || "");
  const [metaDesc, setMetaDesc] = useState(
    truncate(initialData?.metaDescription || "", MAX_META_DESC)
  );
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const handleMetaDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMetaDesc(value.slice(0, MAX_META_DESC));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const autoSlug = value
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[^a-z0-9 -]/g, "") // remove special chars
      .replace(/\s+/g, "-") // replace spaces with hyphens
      .replace(/-+/g, "-") // remove consecutive hyphens
      .replace(/^-+|-+$/g, ""); // trim hyphens
    setSlug(autoSlug);
  };

  const handleGenerateAI = async () => {
    const title = titleRef.current?.value;
    if (!title) {
      toast.error("Ingresa un título primero para generar la descripción");
      return;
    }

    setIsGeneratingAI(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: title }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      if (descRef.current) {
        descRef.current.value = data.text;
      }
      toast.success("Descripción generada por IA");
    } catch (error: any) {
      toast.error(error.message || "Error al generar con IA");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleGenerateSEO = async () => {
    const title = titleRef.current?.value;
    const version = (document.getElementById("version") as HTMLInputElement)?.value;
    if (!title) {
      toast.error("Ingresa un título primero para generar el SEO");
      return;
    }

    const prefix = `Descargar ${title}${version ? ` ${version}` : ""}. `;

    setMetaTitle(`Descargar ${title}${version ? ` ${version}` : ""}`);
    
    setIsGeneratingSEO(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: title, type: "seo" }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      const combined = `${prefix}${data.text}`;
      setMetaDesc(truncate(combined, MAX_META_DESC));
      toast.success("SEO generado por IA");
    } catch (error: any) {
      toast.error(error.message || "Error al generar SEO con IA");
    } finally {
      setIsGeneratingSEO(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!coverImage) {
      toast.error("Debes subir una imagen destacada");
      return;
    }

    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      categoryId: formData.get("categoryId") as string,
      brandId: formData.get("brandId") as string || null,
      version: (formData.get("version") as string) || null,
      fileSizeMB: formData.get("fileSizeMB") ? parseFloat(formData.get("fileSizeMB") as string) : null,
      featured: formData.get("featured") === "on",
      trending: formData.get("trending") === "on",
      isNew: formData.get("isNew") === "on",
      coverImage,
      fileKey: fileKey || null,
      metaTitle: formData.get("metaTitle") as string,
      metaDescription: formData.get("metaDescription") as string,
      demoUrl: (formData.get("demoUrl") as string) || undefined,
    };

    let result;
    if (initialData?.id) {
      result = await updateProductAction(initialData.id, data);
    } else {
      result = await createProductAction(data);
    }

    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(initialData?.id ? "Producto actualizado correctamente" : "Producto creado correctamente");
      router.push("/admin/products");
      router.refresh();
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? "Editar Producto" : "Agregar Producto"}</CardTitle>
        <CardDescription>{initialData ? "Modifica los detalles del producto." : "Crea un nuevo producto digital en el marketplace."}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Imagen Destacada (Portada)</Label>
            <div className="max-w-sm">
              <FileUploader 
                type="image" 
                defaultUrl={initialData?.coverImage}
                maxSizeMB={5} 
                onUploadSuccess={(url) => setCoverImage(url)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del Producto</Label>
              <Input id="title" name="title" ref={titleRef} onChange={handleTitleChange} defaultValue={initialData?.title} placeholder="Ej. Aurora Theme" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input id="slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Ej. aurora-theme" required />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Descripción</Label>
              <Button 
                type="button" 
                variant="brand" 
                size="sm" 
                className="h-7 text-xs shadow-sm" 
                onClick={handleGenerateAI}
                disabled={isGeneratingAI}
              >
                {isGeneratingAI ? <Loader2 className="size-3 mr-1 animate-spin" /> : <Sparkles className="size-3 mr-1" />}
                Generar con IA
              </Button>
            </div>
            <Textarea id="description" name="description" ref={descRef} defaultValue={initialData?.description} placeholder="Descripción detallada del producto..." required className="min-h-[120px]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio (USD)</Label>
              <Input id="price" name="price" type="number" step="0.01" min="0" defaultValue={initialData?.price} placeholder="0.00" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryId">Categoría</Label>
              <select 
                id="categoryId" 
                name="categoryId" 
                defaultValue={initialData?.categoryId}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandId">Marca / Estudio (Opcional)</Label>
              <select 
                id="brandId" 
                name="brandId" 
                defaultValue={initialData?.brandId || ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Ninguna</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="version">Versión actual</Label>
              <Input id="version" name="version" defaultValue={initialData?.latestVersion} placeholder="Ej. 1.0.0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fileSizeMB">Peso del archivo (MB) - opcional</Label>
              <Input id="fileSizeMB" name="fileSizeMB" type="number" step="0.1" min="0" defaultValue={initialData?.fileSizeMB} placeholder="Ej. 13.2" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Archivo del Producto (.zip, .rar)</Label>
            <FileUploader 
              type="file" 
              defaultUrl={initialData?.fileName || initialData?.fileKey}
              accept=".zip,.rar,.tar.gz,.pdf" 
              maxSizeMB={500} 
              onUploadSuccess={(url) => setFileKey(url)} 
            />
            <p className="text-xs text-muted-foreground mt-1">Este archivo será almacenado de forma privada y solo accesible tras la compra.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="demoUrl">URL de Live Demo</Label>
            <Input id="demoUrl" name="demoUrl" type="url" defaultValue={initialData?.demoUrl || ""} placeholder="https://demo.tudominio.com" />
            <p className="text-xs text-muted-foreground">Enlace a la demo en vivo del producto. Aparecerá un botón "Live Demo" en la página de producto.</p>
          </div>

          <div className="space-y-3 pt-2">
            <Label>Insignias (Badges)</Label>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox id="featured" name="featured" defaultChecked={initialData?.featured} />
                <Label htmlFor="featured" className="font-normal cursor-pointer">Destacado</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="trending" name="trending" defaultChecked={initialData?.trending} />
                <Label htmlFor="trending" className="font-normal cursor-pointer">Tendencia</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="isNew" name="isNew" defaultChecked={initialData ? initialData?.isNew : true} />
                <Label htmlFor="isNew" className="font-normal cursor-pointer">Nuevo</Label>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Optimización SEO</h3>
                <p className="text-sm text-muted-foreground">Mejora el posicionamiento en buscadores como Google.</p>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleGenerateSEO}
                disabled={isGeneratingSEO}
              >
                {isGeneratingSEO ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Sparkles className="size-4 mr-2 text-brand-500" />}
                Generar SEO con IA
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="metaTitle">SEO Title</Label>
              <Input 
                id="metaTitle" 
                name="metaTitle" 
                value={metaTitle} 
                onChange={(e) => setMetaTitle(e.target.value)} 
                placeholder="Ej. Descargar Aurora Theme 1.0.0" 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="metaDescription">SEO Description</Label>
                <span className={`text-xs ${metaDesc.length > MAX_META_DESC ? "text-destructive" : "text-muted-foreground"}`}>
                  {metaDesc.length}/{MAX_META_DESC}
                </span>
              </div>
              <Textarea 
                id="metaDescription" 
                name="metaDescription" 
                value={metaDesc} 
                onChange={handleMetaDescChange} 
                placeholder="Meta descripción atractiva para los buscadores..." 
                maxLength={MAX_META_DESC}
                className="min-h-[80px]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" variant="brand" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Actualizar Producto" : "Guardar Producto"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
