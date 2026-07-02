import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "next-intl/server";
import { ProfileForm } from "@/components/dashboard/settings/profile-form";
import { PasswordForm } from "@/components/dashboard/settings/password-form";
import { NotificationSettings } from "@/components/dashboard/settings/notification-settings";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  const t = await getTranslations("dashboard.settings");

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">{t("title")}</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ProfileForm
            user={{
              name: user.name,
              email: user.email,
              username: user.username,
              bio: user.bio,
              image: user.image,
              role: user.role,
              twoFactorEnabled: user.twoFactorEnabled,
            }}
          />
          <PasswordForm hasPassword={!!user.passwordHash} />
          <NotificationSettings
            preferences={{
              marketingEmails: user.marketingEmails,
              notifyNewProducts: user.notifyNewProducts,
              notifyOffers: user.notifyOffers,
              notifyUpdates: user.notifyUpdates,
            }}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("accountInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("role")}</span>
                <Badge variant={user.role === "ADMIN" ? "brand" : "secondary"}>
                  {user.role}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("memberSince")}</span>
                <span>{formatDate(user.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("twoFactor")}</span>
                <Badge variant={user.twoFactorEnabled ? "success" : "secondary"}>
                  {user.twoFactorEnabled ? t("enabled") : t("disabled")}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("email")}</span>
                <span className="max-w-[180px] truncate">{user.email}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
