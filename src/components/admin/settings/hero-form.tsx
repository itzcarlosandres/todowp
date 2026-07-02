"use client";

import * as React from "react";
import { saveHeroConfigAction } from "@/components/home/hero-actions";
import type { HeroConfig, HeroStat, HeroTrustBadge } from "@/components/home/hero-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "@/components/ui/file-uploader";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, LayoutTemplate } from "lucide-react";
import * as Icons from "lucide-react";

interface HeroFormProps {
  initialEs: HeroConfig;
  initialEn: HeroConfig;
}

function formatIconName(name: string) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

function IconPreview({ name }: { name: string }) {
  const formatted = formatIconName(name);
  const IconComponent =
    ((Icons as unknown) as Record<string, React.ElementType>)[formatted] || Icons.Circle;
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-500/10 text-brand-600">
      <IconComponent className="size-4" />
    </div>
  );
}

function HeroLocaleForm({
  config,
  onChange,
}: {
  config: HeroConfig;
  onChange: (config: HeroConfig) => void;
}) {
  const update = <K extends keyof HeroConfig>(key: K, value: HeroConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  const updateBadge = (badge: Partial<HeroConfig["badge"]>) => {
    update("badge", { ...config.badge, ...badge });
  };

  const updateTitle = (title: Partial<HeroConfig["title"]>) => {
    update("title", { ...config.title, ...title });
  };

  const updateSearch = (search: Partial<HeroConfig["search"]>) => {
    update("search", { ...config.search, ...search });
  };

  const updateImage = (image: Partial<HeroConfig["image"]>) => {
    update("image", { ...config.image, ...image });
  };

  const updateTrustBadge = (index: number, patch: Partial<HeroTrustBadge>) => {
    const next = config.trustBadges.map((b, i) => (i === index ? { ...b, ...patch } : b));
    update("trustBadges", next);
  };

  const addTrustBadge = () => {
    update("trustBadges", [...config.trustBadges, { icon: "Shield", text: "" }]);
  };

  const removeTrustBadge = (index: number) => {
    update("trustBadges", config.trustBadges.filter((_, i) => i !== index));
  };

  const updateStat = (index: number, patch: Partial<HeroStat>) => {
    const next = config.stats.map((s, i) => (i === index ? { ...s, ...patch } : s));
    update("stats", next);
  };

  const addStat = () => {
    update("stats", [...config.stats, { value: "0", label: "", icon: "Star" }]);
  };

  const removeStat = (index: number) => {
    update("stats", config.stats.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label className="text-base">Hero activo</Label>
          <p className="text-sm text-muted-foreground">Muestra u oculta toda la sección Hero.</p>
        </div>
        <Switch checked={config.enabled} onCheckedChange={(v) => update("enabled", v)} />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Badge</h3>
        <div className="flex items-center gap-4">
          <Switch
            checked={config.badge.enabled}
            onCheckedChange={(v) => updateBadge({ enabled: v })}
          />
          <div className="flex-1 space-y-2">
            <Label>Texto del badge</Label>
            <Input
              value={config.badge.text}
              onChange={(e) => updateBadge({ text: e.target.value })}
              disabled={!config.badge.enabled}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Título</h3>
        <div className="space-y-2">
          <Label>Texto completo del título</Label>
          <Input
            value={config.title.text}
            onChange={(e) => updateTitle({ text: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Palabras resaltadas al final</Label>
          <Input
            type="number"
            min={0}
            max={10}
            value={config.title.highlightLastWords}
            onChange={(e) => updateTitle({ highlightLastWords: parseInt(e.target.value, 10) || 0 })}
          />
          <p className="text-xs text-muted-foreground">
            Las últimas N palabras se mostrarán con el gradiente. Pon 0 para no resaltar.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Subtítulo</h3>
        <Textarea
          value={config.subtitle}
          onChange={(e) => update("subtitle", e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Buscador</h3>
        <div className="flex items-center gap-4">
          <Switch checked={config.search.enabled} onCheckedChange={(v) => updateSearch({ enabled: v })} />
          <div className="flex-1 space-y-2">
            <Label>Hint de búsqueda</Label>
            <Input
              value={config.search.hint}
              onChange={(e) => updateSearch({ hint: e.target.value })}
              disabled={!config.search.enabled}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Trust Badges</h3>
        {config.trustBadges.map((badge, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
            <IconPreview name={badge.icon} />
            <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
              <Input
                placeholder="Ícono (Lucide)"
                value={badge.icon}
                onChange={(e) => updateTrustBadge(i, { icon: e.target.value })}
              />
              <Input
                placeholder="Texto"
                value={badge.text}
                onChange={(e) => updateTrustBadge(i, { text: e.target.value })}
              />
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeTrustBadge(i)}>
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addTrustBadge}>
          <Plus className="mr-2 size-4" /> Agregar badge
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Stats</h3>
        {config.stats.map((stat, i) => (
          <div key={i} className="grid grid-cols-1 gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <Input
              placeholder="Valor (ej. 12,500+)"
              value={stat.value}
              onChange={(e) => updateStat(i, { value: e.target.value })}
            />
            <Input
              placeholder="Etiqueta"
              value={stat.label}
              onChange={(e) => updateStat(i, { label: e.target.value })}
            />
            <Input
              placeholder="Ícono Lucide (ej. Package)"
              value={stat.icon || ""}
              onChange={(e) => updateStat(i, { icon: e.target.value })}
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => removeStat(i)}>
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addStat}>
          <Plus className="mr-2 size-4" /> Agregar stat
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Imagen del Hero</h3>
        <div className="flex items-center gap-4">
          <Switch checked={config.image.enabled} onCheckedChange={(v) => updateImage({ enabled: v })} />
          <div className="flex-1 space-y-4">
            <FileUploader
              type="image"
              defaultUrl={config.image.src}
              onUploadSuccess={(url) => updateImage({ src: url })}
            />
            <Input
              placeholder="Texto alternativo (alt)"
              value={config.image.alt}
              onChange={(e) => updateImage({ alt: e.target.value })}
              disabled={!config.image.enabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroForm({ initialEs, initialEn }: HeroFormProps) {
  const [es, setEs] = React.useState<HeroConfig>(initialEs);
  const [en, setEn] = React.useState<HeroConfig>(initialEn);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const [resEs, resEn] = await Promise.all([
      saveHeroConfigAction("es", es),
      saveHeroConfigAction("en", en),
    ]);

    setLoading(false);

    if (resEs.error || resEn.error) {
      toast.error(resEs.error || resEn.error || "Error al guardar");
    } else {
      toast.success("Configuración del Hero guardada");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LayoutTemplate className="size-5" /> Hero / Sección Principal
        </CardTitle>
        <CardDescription>
          Personaliza los textos, stats, badges e imagen del Hero para cada idioma.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="es">
            <TabsList className="mb-4">
              <TabsTrigger value="es">Español</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
            </TabsList>
            <TabsContent value="es">
              <HeroLocaleForm config={es} onChange={setEs} />
            </TabsContent>
            <TabsContent value="en">
              <HeroLocaleForm config={en} onChange={setEn} />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end border-t pt-4">
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
