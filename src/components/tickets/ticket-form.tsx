"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createTicketAction } from "@/modules/tickets";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

export function TicketForm() {
  const t = useTranslations("tickets");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [priority, setPriority] = useState("MEDIUM");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/settings/ticket-categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => setCategories([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("priority", priority);
    if (category) formData.set("category", category);

    const res = await createTicketAction(formData);
    if (res?.error) toast.error(res.error);
    else {
      toast.success(t("created"));
      router.push(res?.ticketId ? `/dashboard/tickets/${res.ticketId}` : "/dashboard/tickets");
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader><CardTitle>{t("newTicket")}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">{t("subject")}</Label>
            <Input id="subject" name="subject" required maxLength={200} placeholder={t("subjectPlaceholder")} />
          </div>
          <div className="space-y-2">
            <Label>{t("category")}</Label>
            {categories.length > 0 ? (
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder={t("categoryPlaceholder")} /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input name="category" maxLength={100} placeholder={t("categoryPlaceholder")} />
            )}
          </div>
          <div className="space-y-2">
            <Label>{t("priority")}</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">{t("low")}</SelectItem>
                <SelectItem value="MEDIUM">{t("medium")}</SelectItem>
                <SelectItem value="HIGH">{t("high")}</SelectItem>
                <SelectItem value="URGENT">{t("urgent")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">{t("message")}</Label>
            <Textarea id="body" name="body" required rows={5} maxLength={5000} placeholder={t("messagePlaceholder")} />
          </div>
          <Button type="submit" variant="brand" disabled={loading} className="w-full">
            {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Send className="mr-2 size-4" />}
            {t("send")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
