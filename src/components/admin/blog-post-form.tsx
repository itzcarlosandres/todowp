"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBlogPostAction, updateBlogPostAction } from "@/app/[locale]/(admin)/admin/blog/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileUploader } from "@/components/ui/file-uploader";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { useRef } from "react";

interface BlogPostFormProps {
  initialData?: {
    id: string; title: string; slug: string; excerpt: string; content: string;
    coverImage: string; categoryId: string; tags: { tag: { name: string } }[];
    metaTitle: string; metaDescription: string; status: string;
  };
  categories: { id: string; name: string }[];
}

export function BlogPostForm({ initialData, categories }: BlogPostFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const [tagsInput, setTagsInput] = useState(
    initialData?.tags?.map((t) => t.tag.name).join(", ") || ""
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerateBlog = async () => {
    const title = titleRef.current?.value;
    if (!title) { toast.error("Ingresa un título primero"); return; }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: title, type: "blog" }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (contentRef.current) contentRef.current.value = data.text;
      toast.success("Contenido generado por IA");
    } catch (err: any) { toast.error(err.message || "Error al generar con IA"); }
    setIsGenerating(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isEdit) return;
    const value = e.target.value;
    const autoSlug = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
    setSlug(autoSlug);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      excerpt: formData.get("excerpt") as string,
      content: formData.get("content") as string,
      coverImage,
      categoryId: formData.get("categoryId") as string,
      tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      metaTitle: formData.get("metaTitle") as string,
      metaDescription: formData.get("metaDescription") as string,
      status: status as "DRAFT" | "PUBLISHED",
    };

    const result = isEdit ? await updateBlogPostAction(initialData!.id, data) : await createBlogPostAction(data);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success(isEdit ? "Post actualizado" : "Post creado");
      router.push("/admin/blog");
      router.refresh();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Editar post" : "Nuevo post"}</CardTitle>
        <CardDescription>Escribe y publica contenido en el blog del marketplace.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input id="title" name="title" defaultValue={initialData?.title} required onChange={handleTitleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Extracto</Label>
            <Textarea id="excerpt" name="excerpt" defaultValue={initialData?.excerpt || ""} rows={2} placeholder="Breve resumen del post..." />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Contenido (Markdown) *</Label>
              <Button type="button" variant="brand" size="sm" className="h-7 text-xs shadow-sm" onClick={handleGenerateBlog} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="size-3 mr-1 animate-spin" /> : <Sparkles className="size-3 mr-1" />}
                Generar con IA
              </Button>
            </div>
            <Textarea id="content" name="content" ref={contentRef} defaultValue={initialData?.content || ""} rows={12} required className="font-mono text-sm" placeholder="Escribe el contenido en Markdown o usa IA para generarlo..." />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Imagen de portada</Label>
              <FileUploader type="image" defaultUrl={coverImage} onUploadSuccess={(url) => setCoverImage(url)} />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoría</Label>
                <select id="categoryId" name="categoryId" defaultValue={initialData?.categoryId || ""} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Sin categoría</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Borrador</SelectItem>
                    <SelectItem value="PUBLISHED">Publicado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (separados por coma)</Label>
            <Input id="tags_input" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="WordPress, SEO, Tutorial" />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">SEO</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input id="metaTitle" name="metaTitle" defaultValue={initialData?.metaTitle || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Input id="metaDescription" name="metaDescription" defaultValue={initialData?.metaDescription || ""} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="brand" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEdit ? "Guardar cambios" : "Crear post"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/blog")}>Cancelar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
