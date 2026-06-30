"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Ban, CheckCircle, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { toggleMembershipStatus, deleteMembership } from "./actions";

export function MembershipActions({ 
  membershipId, 
  currentStatus 
}: { 
  membershipId: string; 
  currentStatus: string 
}) {
  const [loading, setLoading] = useState(false);

  const onToggleStatus = async () => {
    setLoading(true);
    try {
      const newStatus = currentStatus === "ACTIVE" ? "CANCELLED" : "ACTIVE";
      await toggleMembershipStatus(membershipId, newStatus);
      toast.success(`Membresía marcada como ${newStatus}`);
    } catch (err: any) {
      toast.error("Error al actualizar estado");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (!confirm("¿Seguro que quieres eliminar esta membresía?")) return;
    setLoading(true);
    try {
      await deleteMembership(membershipId);
      toast.success("Membresía eliminada");
    } catch (err: any) {
      toast.error("Error al eliminar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onToggleStatus} 
        disabled={loading}
        title={currentStatus === "ACTIVE" ? "Cancelar Membresía" : "Activar Membresía"}
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : (
          currentStatus === "ACTIVE" ? <Ban className="size-4 text-amber-500" /> : <CheckCircle className="size-4 text-green-500" />
        )}
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onDelete} 
        disabled={loading}
        title="Eliminar Membresía"
      >
        <Trash2 className="size-4 text-red-500" />
      </Button>
    </div>
  );
}
