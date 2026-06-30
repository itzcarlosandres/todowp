"use client";

import { useState } from "react";
import { MoreHorizontal, Shield, ShieldAlert, Trash, Ban, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { updateUserRole, updateUserStatus, deleteUser } from "./actions";
import type { UserRole, UserStatus } from "@prisma/client";

interface UserActionsMenuProps {
  userId: string;
  currentRole: UserRole;
  currentStatus: UserStatus;
  userName: string | null;
}

export function UserActionsMenu({ userId, currentRole, currentStatus, userName }: UserActionsMenuProps) {
  const [loading, setLoading] = useState(false);

  const handleRoleChange = async (role: UserRole) => {
    setLoading(true);
    const res = await updateUserRole(userId, role);
    if (res.error) toast.error(res.error);
    else toast.success("Rol actualizado exitosamente");
    setLoading(false);
  };

  const handleStatusChange = async (status: UserStatus) => {
    setLoading(true);
    const res = await updateUserStatus(userId, status);
    if (res.error) toast.error(res.error);
    else toast.success("Estado actualizado exitosamente");
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario ${userName ?? "seleccionado"}?`)) return;
    setLoading(true);
    const res = await deleteUser(userId);
    if (res.error) toast.error(res.error);
    else toast.success("Usuario eliminado exitosamente");
    setLoading(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {currentRole === "USER" ? (
          <DropdownMenuItem onClick={() => handleRoleChange("ADMIN")}>
            <ShieldAlert className="mr-2 h-4 w-4" />
            Hacer Administrador
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => handleRoleChange("USER")}>
            <Shield className="mr-2 h-4 w-4" />
            Quitar permisos de Admin
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {currentStatus !== "ACTIVE" && (
          <DropdownMenuItem onClick={() => handleStatusChange("ACTIVE")}>
            <CheckCircle2 className="mr-2 h-4 w-4 text-success" />
            Activar usuario
          </DropdownMenuItem>
        )}
        {currentStatus !== "BLOCKED" && (
          <DropdownMenuItem onClick={() => handleStatusChange("BLOCKED")}>
            <Ban className="mr-2 h-4 w-4 text-warning" />
            Bloquear usuario
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
          <Trash className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
