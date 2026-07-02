"use client";

import { useState, useEffect } from "react";
import { updateCashbackConfigAction, getCashbackStats } from "@/modules/cashback";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function CashbackConfigForm() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalEarned: 0, totalSpent: 0, totalUsers: 0 });

  useEffect(() => {
    getCashbackStats().then(setStats);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateCashbackConfigAction(formData);
    if (res?.error) toast.error(res.error);
    else toast.success("Configuración guardada");
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Ganado</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-emerald-500">${stats.totalEarned.toFixed(2)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Usado</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-amber-500">${stats.totalSpent.toFixed(2)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Usuarios</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.totalUsers}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de Cashback</CardTitle>
          <CardDescription>Define las reglas de recompensa para los clientes.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="percentage">Porcentaje (%)</Label>
                <Input id="percentage" name="percentage" type="number" step="0.5" min="0" max="100" defaultValue={5} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minOrderAmount">Compra mínima ($)</Label>
                <Input id="minOrderAmount" name="minOrderAmount" type="number" step="0.01" min="0" defaultValue={0} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxCashbackAmount">Tope máximo ($)</Label>
                <Input id="maxCashbackAmount" name="maxCashbackAmount" type="number" step="0.01" min="0" defaultValue={50} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiresInDays">Expira en (días)</Label>
                <Input id="expiresInDays" name="expiresInDays" type="number" min="0" defaultValue={90} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium text-sm">Activar cashback</p>
                <p className="text-xs text-muted-foreground">Los clientes ganarán saldo con cada compra</p>
              </div>
              <input type="hidden" name="isActive" value="true" id="isActiveHidden" />
              <Switch defaultChecked name="isActiveChecked" onCheckedChange={(c) => {
                (document.getElementById("isActiveHidden") as HTMLInputElement).value = String(c);
              }} />
            </div>
            <Button type="submit" variant="brand" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Guardar configuración
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
