"use client";

import { useState } from "react";
import { saveSettingsAction } from "@/app/[locale]/(admin)/admin/settings/settings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

export function TicketCategoriesForm({ initialData }: { initialData: Record<string, any> }) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>(
    initialData.ticket_categories || ["Pagos", "Descargas", "Cuenta", "Técnico", "Otro"]
  );

  const add = () => setCategories([...categories, ""]);
  const remove = (i: number) => setCategories(categories.filter((_, idx) => idx !== i));
  const update = (i: number, v: string) => {
    const next = [...categories];
    next[i] = v;
    setCategories(next);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const filtered = categories.filter((c) => c.trim() !== "");
    const res = await saveSettingsAction("tickets", { ticket_categories: filtered });
    setLoading(false);
    if (res.error) toast.error(res.error);
    else toast.success("Categorías de tickets guardadas");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Categorías de Tickets</CardTitle>
            <CardDescription>Define las categorías disponibles al crear un ticket de soporte.</CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={add}>
            <Plus className="size-4 mr-1" /> Agregar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
              No hay categorías. Haz clic en "Agregar".
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((cat, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    value={cat}
                    onChange={(e) => update(i, e.target.value)}
                    placeholder={`Categoría ${i + 1}`}
                    required
                    className="flex-1"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}
                    className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end">
            <Button type="submit" variant="brand" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Guardar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
