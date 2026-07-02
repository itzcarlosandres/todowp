/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { saveSettingsAction } from "@/app/[locale]/(admin)/admin/settings/settings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUploader } from "@/components/ui/file-uploader";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Palette, Sliders } from "lucide-react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandingForm({ initialData }: { initialData: Record<string, any> }) {
  const [loading, setLoading] = useState(false);
  const [logoType, setLogoType] = useState(initialData.brand_logo_type || "TEXT");
  const [logoImage, setLogoImage] = useState(initialData.brand_logo_image || "");
  const [favicon, setFavicon] = useState(initialData.brand_favicon || "");
  const [iconName, setIconName] = useState(initialData.brand_logo_icon || "ShoppingBag");

  // Logo size and colors
  const [logoSize, setLogoSize] = useState(initialData.brand_logo_size || "md");
  const [colorFrom, setColorFrom] = useState(initialData.brand_logo_color_from || "#7c3aed");
  const [colorTo, setColorTo] = useState(initialData.brand_logo_color_to || "#a78bfa");
  const [iconColor, setIconColor] = useState(initialData.brand_logo_icon_color || "#ffffff");
  const [textColorFrom, setTextColorFrom] = useState(initialData.brand_logo_text_color_from || "#1a1a2e");
  const [textColorTo, setTextColorTo] = useState(initialData.brand_logo_text_color_to || "#7c3aed");
  const [textSize, setTextSize] = useState(initialData.brand_logo_text_size || "lg");
  const [iconBgStyle, setIconBgStyle] = useState(initialData.brand_logo_bg_style || "gradient");

  const formatIconName = (name: string) => {
    return name
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join("");
  };

  const formattedIconName = formatIconName(iconName);
  const IconComponent =
    ((Icons as unknown) as Record<string, React.ElementType>)[formattedIconName] || Icons.ShoppingBag;

  const sizeClasses: Record<string, string> = {
    sm: "size-6",
    md: "size-8",
    lg: "size-10",
    xl: "size-12",
  };

  const iconSizeClasses: Record<string, string> = {
    sm: "size-3",
    md: "size-4",
    lg: "size-5",
    xl: "size-6",
  };

  const textSizeClasses: Record<string, string> = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
    "2xl": "text-3xl",
    "3xl": "text-4xl",
  };

  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      brand_logo_type: logoType,
      brand_logo_text: formData.get("brand_logo_text"),
      brand_logo_icon: iconName,
      brand_logo_image: logoImage,
      brand_favicon: favicon,
      brand_logo_size: logoSize,
      brand_logo_color_from: colorFrom,
      brand_logo_color_to: colorTo,
      brand_logo_icon_color: iconColor,
      brand_logo_text_color_from: textColorFrom,
      brand_logo_text_color_to: textColorTo,
      brand_logo_text_size: textSize,
      brand_logo_bg_style: iconBgStyle,
      brand_site_name: formData.get("brand_site_name"),
      brand_site_description: formData.get("brand_site_description"),
      store_home_products_cols: formData.get("store_home_products_cols"),
      store_home_products_limit: formData.get("store_home_products_limit"),
      store_products_default_view: formData.get("store_products_default_view"),
      store_products_cols: formData.get("store_products_cols"),
      promo_bar_active: formData.get("promo_bar_active"),
      promo_bar_text: formData.get("promo_bar_text"),
      promo_bar_subtext: formData.get("promo_bar_subtext"),
      promo_bar_countdown: formData.get("promo_bar_countdown"),
      promo_bar_button_text: formData.get("promo_bar_button_text"),
      promo_bar_button_link: formData.get("promo_bar_button_link"),
    };

    const res = await saveSettingsAction("branding", data);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Configuración de marca guardada");
      queryClient.invalidateQueries({ queryKey: ["brandingSettings"] });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Marca e Identidad (Branding)</CardTitle>
        <CardDescription>Configura el logo, colores, tamaño y favicon de tu marketplace.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Palette className="size-4" /> Tipo de Logo
            </h3>
            <Select value={logoType} onValueChange={setLogoType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TEXT">Texto e Ícono</SelectItem>
                <SelectItem value="IMAGE">Imagen Personalizada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {logoType === "TEXT" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg bg-muted/10">
              <div className="space-y-2">
                <Label>Texto del Logo</Label>
                <Input name="brand_logo_text" defaultValue={initialData.brand_logo_text || "TodoWP"} />
              </div>
              <div className="space-y-2">
                <Label>Nombre del Ícono (Lucide)</Label>
                <div className="flex items-center gap-3">
                  <Input
                    name="brand_logo_icon"
                    value={iconName}
                    onChange={(e) => setIconName(e.target.value)}
                    placeholder="Ej. ShoppingBag"
                  />
                  <div
                    className="flex shrink-0 items-center justify-center rounded-md"
                    style={{
                      background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})`,
                      width: "40px",
                      height: "40px",
                    }}
                  >
                    <IconComponent className="size-5" style={{ color: iconColor }} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Usa el nombre exacto de{" "}
                  <a href="https://lucide.dev/icons/" target="_blank" className="text-brand-500 hover:underline">
                    lucide.dev
                  </a>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 border p-4 rounded-lg bg-muted/10">
              <Label>Subir Imagen de Logo</Label>
              <FileUploader
                type="image"
                defaultUrl={logoImage}
                onUploadSuccess={(url) => setLogoImage(url)}
              />
            </div>
          )}

          {/* Logo Preview */}
          {logoType === "TEXT" && (
            <div className="border p-4 rounded-lg bg-muted/5">
              <Label className="mb-3 block">Vista Previa</Label>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-background border">
                <div
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-lg shadow-md",
                    sizeClasses[logoSize] || "size-8",
                  )}
                  style={{
                    background: iconBgStyle === "gradient"
                      ? `linear-gradient(135deg, ${colorFrom}, ${colorTo})`
                      : iconBgStyle === "solid"
                        ? colorFrom
                        : "transparent",
                    border: iconBgStyle === "outline" ? `2px solid ${colorFrom}` : "none",
                  }}
                >
                  <IconComponent
                    className={iconSizeClasses[logoSize] || "size-4"}
                    style={{ color: iconColor }}
                  />
                </div>
                <span
                  className={cn(
                    "font-[family-name:var(--font-bricolage)] font-bold tracking-tight",
                    textSizeClasses[textSize] || "text-lg",
                  )}
                  style={{
                    backgroundImage: `linear-gradient(90deg, ${textColorFrom}, ${textColorTo})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {initialData.brand_logo_text || "TodoWP"}
                </span>
              </div>
            </div>
          )}

          {/* Size and Color Customization */}
          {logoType === "TEXT" && (
            <div className="border p-4 rounded-lg bg-muted/5 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Sliders className="size-4" /> Personalización de Tamaño y Colores
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tamaño del ícono</Label>
                  <Select value={logoSize} onValueChange={setLogoSize}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Pequeño (24px)</SelectItem>
                      <SelectItem value="md">Mediano (32px)</SelectItem>
                      <SelectItem value="lg">Grande (40px)</SelectItem>
                      <SelectItem value="xl">Extra grande (48px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tamaño del texto</Label>
                  <Select value={textSize} onValueChange={setTextSize}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Pequeño (16px)</SelectItem>
                      <SelectItem value="md">Mediano (18px)</SelectItem>
                      <SelectItem value="lg">Grande (20px)</SelectItem>
                      <SelectItem value="xl">Extra grande (24px)</SelectItem>
                      <SelectItem value="2xl">Muy grande (30px)</SelectItem>
                      <SelectItem value="3xl">Enorme (36px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Estilo de fondo del ícono</Label>
                <Select value={iconBgStyle} onValueChange={setIconBgStyle}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gradient">Degradado</SelectItem>
                    <SelectItem value="solid">Color sólido</SelectItem>
                    <SelectItem value="outline">Solo borde</SelectItem>
                    <SelectItem value="none">Sin fondo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="colorFrom">Color ícono (inicio)</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="colorFrom"
                      type="color"
                      value={colorFrom}
                      onChange={(e) => setColorFrom(e.target.value)}
                      className="h-10 w-12 rounded border border-input cursor-pointer"
                    />
                    <Input value={colorFrom} onChange={(e) => setColorFrom(e.target.value)} className="font-mono text-xs" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="colorTo">Color ícono (fin)</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="colorTo"
                      type="color"
                      value={colorTo}
                      onChange={(e) => setColorTo(e.target.value)}
                      className="h-10 w-12 rounded border border-input cursor-pointer"
                    />
                    <Input value={colorTo} onChange={(e) => setColorTo(e.target.value)} className="font-mono text-xs" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iconColor">Color del ícono</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="iconColor"
                      type="color"
                      value={iconColor}
                      onChange={(e) => setIconColor(e.target.value)}
                      className="h-10 w-12 rounded border border-input cursor-pointer"
                    />
                    <Input value={iconColor} onChange={(e) => setIconColor(e.target.value)} className="font-mono text-xs" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="textColorFrom">Color texto (inicio)</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="textColorFrom"
                      type="color"
                      value={textColorFrom}
                      onChange={(e) => setTextColorFrom(e.target.value)}
                      className="h-10 w-12 rounded border border-input cursor-pointer"
                    />
                    <Input value={textColorFrom} onChange={(e) => setTextColorFrom(e.target.value)} className="font-mono text-xs" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="textColorTo">Color texto (fin)</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="textColorTo"
                      type="color"
                      value={textColorTo}
                      onChange={(e) => setTextColorTo(e.target.value)}
                      className="h-10 w-12 rounded border border-input cursor-pointer"
                    />
                    <Input value={textColorTo} onChange={(e) => setTextColorTo(e.target.value)} className="font-mono text-xs" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 rounded-lg border p-4">
            <div className="shrink-0">
              {favicon ? (
                <img src={favicon} alt="Favicon" className="size-10 rounded object-cover" />
              ) : (
                <div className="flex size-10 items-center justify-center rounded bg-muted text-xs text-muted-foreground">ICO</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Favicon del sitio</p>
              <p className="text-[11px] text-muted-foreground">Ícono de pestaña del navegador (32x32)</p>
            </div>
            <label className="cursor-pointer rounded-md bg-muted px-3 py-1.5 text-xs font-medium hover:bg-muted/80 transition-colors">
              {favicon ? "Cambiar" : "Subir"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 1 * 1024 * 1024) { toast.error("Máximo 1MB"); return; }
                  const fd = new FormData();
                  fd.append("file", file);
                  fd.append("type", "image");
                  const res = await fetch("/api/upload", { method: "POST", body: fd });
                  const data = await res.json();
                  if (data.error) toast.error(data.error);
                  else { setFavicon(data.url); toast.success("Favicon actualizado"); }
                }}
              />
            </label>
            {favicon && (
              <button
                type="button"
                onClick={() => setFavicon("")}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Quitar
              </button>
            )}
          </div>

          <div className="space-y-4 pt-6 border-t mt-8">
            <h3 className="text-lg font-semibold flex items-center gap-2">SEO Global</h3>
            <p className="text-sm text-muted-foreground">Define el título y descripción que aparecen en Google y redes sociales.</p>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Nombre del sitio (SEO Title)</Label>
                <Input name="brand_site_name" defaultValue={initialData.brand_site_name || ""} placeholder="TodoWP" />
                <p className="text-xs text-muted-foreground">Aparece en pestañas del navegador, Google, Open Graph y JSON-LD.</p>
              </div>
              <div className="space-y-2">
                <Label>Descripción del sitio (Meta Description)</Label>
                <Textarea
                  name="brand_site_description"
                  defaultValue={initialData.brand_site_description || ""}
                  placeholder="Marketplace premium de productos digitales..."
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">Descripción por defecto para SEO en toda la web.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t mt-8">
            <h3 className="text-lg font-semibold flex items-center gap-2">Diseño del Catálogo en Inicio</h3>
            <p className="text-sm text-muted-foreground">Controla cómo se ven los productos en la página principal.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Columnas de productos (PC)</Label>
                <Select name="store_home_products_cols" defaultValue={initialData.store_home_products_cols || "5"}>
                  <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Columnas (Grandes)</SelectItem>
                    <SelectItem value="4">4 Columnas (Medianos)</SelectItem>
                    <SelectItem value="5">5 Columnas (Pequeños)</SelectItem>
                    <SelectItem value="6">6 Columnas (Muy pequeños)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Mientras más columnas, más pequeños se verán los productos.</p>
              </div>
              <div className="space-y-2">
                <Label>Límite de productos por sección</Label>
                <Input type="number" name="store_home_products_limit" defaultValue={initialData.store_home_products_limit || "10"} min="1" max="40" />
                <p className="text-xs text-muted-foreground">Cuántos productos mostrar antes de "Ver todos".</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t mt-8">
            <h3 className="text-lg font-semibold flex items-center gap-2">Diseño del Catálogo General (Products)</h3>
            <p className="text-sm text-muted-foreground">Controla el diseño de la página de productos (marketplace).</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Vista por defecto</Label>
                <Select name="store_products_default_view" defaultValue={initialData.store_products_default_view || "grid"}>
                  <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Cuadrícula (Grid)</SelectItem>
                    <SelectItem value="list">Lista (List)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">La vista inicial para los usuarios.</p>
              </div>
              <div className="space-y-2">
                <Label>Columnas de productos en Cuadrícula (PC)</Label>
                <Select name="store_products_cols" defaultValue={initialData.store_products_cols || "3"}>
                  <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Columnas (Grandes)</SelectItem>
                    <SelectItem value="3">3 Columnas (Medianos)</SelectItem>
                    <SelectItem value="4">4 Columnas (Pequeños)</SelectItem>
                    <SelectItem value="5">5 Columnas (Muy pequeños)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Aplica cuando la vista activa es Cuadrícula.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t mt-8">
            <h3 className="text-lg font-semibold flex items-center gap-2">Barra Promocional (Top Bar)</h3>
            <p className="text-sm text-muted-foreground">Muestra una barra superior con cuenta regresiva y ofertas.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Activar Barra Promocional</Label>
                <Select name="promo_bar_active" defaultValue={initialData.promo_bar_active || "false"}>
                  <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Activa (Mostrar)</SelectItem>
                    <SelectItem value="false">Inactiva (Ocultar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fecha límite (Cuenta regresiva)</Label>
                <Input type="datetime-local" name="promo_bar_countdown" defaultValue={initialData.promo_bar_countdown || ""} />
                <p className="text-xs text-muted-foreground">Déjalo vacío si no quieres mostrar el reloj.</p>
              </div>
              <div className="space-y-2">
                <Label>Texto Principal</Label>
                <Input name="promo_bar_text" defaultValue={initialData.promo_bar_text || "Lifetime Premium — 30% OFF"} />
              </div>
              <div className="space-y-2">
                <Label>Subtexto (Opcional)</Label>
                <Input name="promo_bar_subtext" defaultValue={initialData.promo_bar_subtext || "5 licencias incluidas"} />
              </div>
              <div className="space-y-2">
                <Label>Texto del Botón</Label>
                <Input name="promo_bar_button_text" defaultValue={initialData.promo_bar_button_text || "Get It Now"} />
              </div>
              <div className="space-y-2">
                <Label>Enlace del Botón</Label>
                <Input name="promo_bar_button_link" defaultValue={initialData.promo_bar_button_link || "/membership"} />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t mt-4">
            <Button type="submit" variant="brand" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
