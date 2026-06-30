"use client";

import { useState } from "react";
import { saveMembershipSettings } from "./membership-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Crown } from "lucide-react";

type PlanData = {
  id?: string;
  name: string;
  interval: string;
  price: number;
  features: string[];
  authorizedCategories: string[];
};

export function MembershipForm({ 
  categories, 
  plans: initialPlans,
}: { 
  categories: { id: string; name: string }[];
  plans: PlanData[];
}) {
  const [loading, setLoading] = useState(false);
  
  // Ensure we always have 3 default plans if DB is empty
  const defaultPlans: PlanData[] = [
    { name: "Mensual", interval: "month", price: 15, features: ["Acceso ilimitado por 1 mes", "Soporte estándar"], authorizedCategories: [] },
    { name: "Anual", interval: "year", price: 120, features: ["Acceso ilimitado por 1 año", "Soporte prioritario", "2 meses gratis"], authorizedCategories: [] },
    { name: "Lifetime", interval: "lifetime", price: 399, features: ["Acceso de por vida", "Soporte VIP", "Acceso a nuevos lanzamientos"], authorizedCategories: [] },
  ];

  const [plans, setPlans] = useState<PlanData[]>(
    initialPlans.length > 0 ? initialPlans : defaultPlans
  );

  const handlePlanChange = (index: number, field: keyof PlanData, value: any) => {
    const newPlans = [...plans];
    const plan = newPlans[index];
    if (!plan) return;
    newPlans[index] = { ...plan, [field]: value };
    setPlans(newPlans);
  };

  const toggleCategory = (planIndex: number, categoryId: string) => {
    const newPlans = [...plans];
    const plan = newPlans[planIndex];
    if (!plan) return;
    if (plan.authorizedCategories.includes(categoryId)) {
      plan.authorizedCategories = plan.authorizedCategories.filter(c => c !== categoryId);
    } else {
      plan.authorizedCategories = [...plan.authorizedCategories, categoryId];
    }
    setPlans(newPlans);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await saveMembershipSettings({
        plans,
      });
      toast.success("Ajustes de membresías guardados");
    } catch (err: any) {
      toast.error(err.message || "Error al guardar ajustes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Planes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="size-5 text-brand-500" /> Planes de Precios y Categorías Autorizadas
          </CardTitle>
          <CardDescription>
            Configura el nombre, precio, beneficios y las categorías que estarán disponibles para descargar en cada nivel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {plans.map((plan, i) => (
            <div key={i} className="p-4 border rounded-xl space-y-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-lg">{plan.name}</h4>
                <Badge variant="outline">{plan.interval}</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre del Plan</Label>
                  <Input 
                    value={plan.name} 
                    onChange={e => handlePlanChange(i, "name", e.target.value)} 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Precio ($)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={plan.price} 
                    onChange={e => handlePlanChange(i, "price", parseFloat(e.target.value))} 
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Beneficios (separados por coma)</Label>
                  <Input 
                    value={plan.features.join(", ")} 
                    onChange={e => handlePlanChange(i, "features", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} 
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <Label className="mb-3 block">Categorías autorizadas para este plan</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-accent/50 transition-colors bg-background">
                      <input 
                        type="checkbox" 
                        checked={(plan.authorizedCategories || []).includes(cat.id)}
                        onChange={() => toggleCategory(i, cat.id)}
                        className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                      />
                      <span className="text-xs font-medium">{cat.name}</span>
                    </label>
                  ))}
                  {categories.length === 0 && (
                    <p className="text-sm text-muted-foreground col-span-full">No hay categorías creadas aún.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button type="submit" variant="brand" disabled={loading}>
          {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
          Guardar Configuración
        </Button>
      </div>
    </form>
  );
}

// Dummy badge for standalone file compile
function Badge({ children, variant }: any) {
  return <span className="px-2 py-1 text-xs border rounded-full font-medium">{children}</span>;
}
