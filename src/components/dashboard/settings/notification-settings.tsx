"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { toggleNotificationAction } from "@/app/[locale]/(dashboard)/dashboard/settings/actions";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NotificationSettingsProps {
  preferences: {
    marketingEmails: boolean;
    notifyNewProducts: boolean;
    notifyOffers: boolean;
    notifyUpdates: boolean;
  };
}

export function NotificationSettings({ preferences }: NotificationSettingsProps) {
  const t = useTranslations("dashboard.settings");
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggle = async (key: string, value: boolean) => {
    setLoading(key);
    const res = await toggleNotificationAction(key, value);
    if (res?.error) toast.error(res.error);
    setLoading(null);
  };

  const items = [
    { key: "notifyNewProducts", label: t("notifyNewProducts"), desc: t("notifyNewProductsDesc") },
    { key: "notifyOffers", label: t("notifyOffers"), desc: t("notifyOffersDesc") },
    { key: "notifyUpdates", label: t("notifyUpdates"), desc: t("notifyUpdatesDesc") },
    { key: "marketingEmails", label: t("notifyMarketing"), desc: t("notifyMarketingDesc") },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("notifications")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/50 transition-colors"
          >
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Switch
              defaultChecked={preferences[item.key as keyof typeof preferences]}
              disabled={loading === item.key}
              onCheckedChange={(checked) => handleToggle(item.key, checked)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
