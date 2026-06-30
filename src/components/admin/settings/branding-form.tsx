/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { saveSettingsAction } from "@/app/[locale]/(admin)/admin/settings/settings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUploader } from "@/components/ui/file-uploader";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Palette } from "lucide-react";
import * as Icons from "lucide-react";

export function BrandingForm({ initialData }: { initialData: Record<string, any> }) {
  const [loading, setLoading] = useState(false);
  const [logoType, setLogoType] = useState(initialData.brand_logo_type || "TEXT");
  const [logoImage, setLogoImage] = useState(initialData.brand_logo_image || "");
  const [favicon, setFavicon] = useState(initialData.brand_favicon || "");
  const [iconName, setIconName] = useState(initialData.brand_logo_icon || "ShoppingBag");

  const formatIconName = (name: string) => {
    return name
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join("");
  };

  const formattedIconName = formatIconName(iconName);
  const IconComponent =
    ((Icons as unknown) as Record<string, React.ElementType>)[formattedIconName] || Icons.ShoppingBag;

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
        <CardDescription>Configura el logo y favicon de tu marketplace.</CardDescription>
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
                <Input name="brand_logo_text" defaultValue={initialData.brand_logo_text || "MarketFlow"} />
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
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-500/10 text-brand-600">
                    <IconComponent className="size-5" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Usa el nombre exacto de <a href="https://lucide.dev/icons/" target="_blank" className="text-brand-500 hover:underline">lucide.dev</a></p>
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

          <div className="space-y-2 pt-4 border-t">
            <Label>Favicon del Sitio (Ícono de pestaña)</Label>
            <FileUploader 
              type="image" 
              defaultUrl={favicon}
              onUploadSuccess={(url) => setFavicon(url)} 
            />
          </div>

          <div className="space-y-4 pt-6 border-t mt-8">
            <h3 className="text-lg font-semibold flex items-center gap-2">
               Diseño del Catálogo en Inicio
            </h3>
            <p className="text-sm text-muted-foreground">Controla cómo se ven los productos en la página principal.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Columnas de productos (PC)</Label>
                <Select name="store_home_products_cols" defaultValue={initialData.store_home_products_cols || "5"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
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
            <h3 className="text-lg font-semibold flex items-center gap-2">
               Diseño del Catálogo General (Products)
            </h3>
            <p className="text-sm text-muted-foreground">Controla el diseño de la página de productos (marketplace).</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Vista por defecto</Label>
                <Select name="store_products_default_view" defaultValue={initialData.store_products_default_view || "grid"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
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
            <h3 className="text-lg font-semibold flex items-center gap-2">
               Barra Promocional (Top Bar)
            </h3>
            <p className="text-sm text-muted-foreground">Muestra una barra superior con cuenta regresiva y ofertas.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Activar Barra Promocional</Label>
                <Select name="promo_bar_active" defaultValue={initialData.promo_bar_active || "false"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
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
