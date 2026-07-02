"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { profileUpdateSchema, type ProfileUpdateValues } from "@/lib/validators";
import { updateProfileAction, updateAvatarAction } from "@/app/[locale]/(dashboard)/dashboard/settings/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProfileFormProps {
  user: {
    name: string | null;
    email: string;
    username: string | null;
    bio: string | null;
    image: string | null;
    role: string;
    twoFactorEnabled: boolean;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const t = useTranslations("dashboard.settings");
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileUpdateValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user.name ?? "",
      username: user.username ?? "",
      bio: user.bio ?? "",
      image: user.image ?? "",
    },
  });

  const onSubmit = async (data: ProfileUpdateValues) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.username) formData.append("username", data.username);
    if (data.bio) formData.append("bio", data.bio);
    if (data.image) formData.append("image", data.image);

    const res = await updateProfileAction(formData);
    if (res?.error) toast.error(res.error);
    else toast.success(res?.success ?? t("profileUpdated"));
    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("avatarTooBig"));
      return;
    }

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "image");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setValue("image", data.url);
      const result = await updateAvatarAction(data.url);
      if (result?.error) toast.error(result.error);
      else toast.success(t("avatarUpdated"));
    } catch {
      toast.error(t("avatarError"));
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profile")}</CardTitle>
        <CardDescription>{t("profileDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative">
            <Avatar className="size-20">
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback className="text-xl">
                {user.name?.charAt(0)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <label
              className={cn(
                "absolute -bottom-1 -right-1 flex size-7 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-opacity hover:opacity-80",
                avatarUploading && "pointer-events-none opacity-50"
              )}
            >
              {avatarUploading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Camera className="size-3.5" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={avatarUploading}
              />
            </label>
          </div>
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge variant={user.role === "ADMIN" ? "brand" : "secondary"} className="mt-1">
              {user.role}
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("nameLabel")}</Label>
            <Input
              id="name"
              startIcon={<User className="size-4" />}
              error={errors.name?.message}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">{t("usernameLabel")}</Label>
            <Input
              id="username"
              startIcon={<Mail className="size-4" />}
              placeholder={t("usernamePlaceholder")}
              error={errors.username?.message}
              {...register("username")}
            />
            {errors.username && (
              <p className="text-xs text-destructive">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">{t("bioLabel")}</Label>
            <Textarea
              id="bio"
              placeholder={t("bioPlaceholder")}
              rows={3}
              {...register("bio")}
            />
            {errors.bio && (
              <p className="text-xs text-destructive">{errors.bio.message}</p>
            )}
          </div>

          <Button type="submit" variant="brand" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t("saving")}
              </>
            ) : (
              t("saveProfile")
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
