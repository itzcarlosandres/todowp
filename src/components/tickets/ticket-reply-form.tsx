"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { replyTicketAction, updateTicketStatusAction } from "@/modules/tickets";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

const STATUS_STEPS = [
  { key: "OPEN", label: "Abierto", color: "bg-emerald-500" },
  { key: "PENDING", label: "Pendiente", color: "bg-amber-500" },
  { key: "RESOLVED", label: "Resuelto", color: "bg-blue-500" },
  { key: "CLOSED", label: "Cerrado", color: "bg-slate-500" },
];

interface TicketReplyFormProps {
  ticketId: string;
  isAdmin?: boolean;
  currentStatus?: string;
}

export function TicketReplyForm({ ticketId, isAdmin = false, currentStatus }: TicketReplyFormProps) {
  const t = useTranslations("tickets");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus ?? "OPEN");

  const currentStep = STATUS_STEPS.findIndex((s) => s.key === status);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    if (isAdmin) formData.set("isStaff", "true");
    const res = await replyTicketAction(ticketId, formData);
    if (res?.error) toast.error(res.error);
    else {
      toast.success(t("replySent"));
      (e.target as HTMLFormElement).reset();
    }
    setLoading(false);
  };

  const handleStatus = async (newStatus: string) => {
    const res = await updateTicketStatusAction(ticketId, newStatus);
    if (res?.error) toast.error(res.error);
    else {
      setStatus(newStatus);
      toast.success(t("statusUpdated"));
    }
  };

  return (
    <div className="space-y-5">
      {isAdmin && (
        <div className="rounded-xl border border-border/40 bg-card p-5">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Proceso del ticket
          </h4>

          <div className="mb-4 flex items-center gap-1">
            {STATUS_STEPS.map((step, i) => (
              <div key={step.key} className="flex items-center flex-1">
                <button
                  onClick={() => handleStatus(step.key)}
                  className={`flex-1 rounded-lg px-3 py-2 text-center text-[11px] font-bold transition-all ${
                    i <= currentStep
                      ? `${step.color} text-white shadow-sm`
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {step.label}
                </button>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`mx-0.5 h-0.5 flex-1 rounded ${i < currentStep ? status === "CLOSED" && i >= currentStep ? "bg-muted" : "bg-brand-500" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {(["OPEN", "PENDING", "RESOLVED", "CLOSED"] as const).filter(s => s !== status).map((s) => (
              <Button key={s} variant="outline" size="sm" className="text-xs h-8" onClick={() => handleStatus(s)}>
                {t(s.toLowerCase())}
              </Button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3">
        <Textarea name="body" required rows={3} className="flex-1" placeholder={t("replyPlaceholder")} />
        <Button type="submit" variant="brand" size="sm" disabled={loading} className="self-end">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </form>
    </div>
  );
}
