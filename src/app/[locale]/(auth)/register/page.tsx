"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/shared/logo";
import { Link as I18nLink } from "@/i18n/routing";

const schema = z
  .object({
    name: z.string().min(2, "Mínimo 2 caracteres").max(60),
    email: z.string().email("Email inválido"),
    password: z.string().min(8, "Mínimo 8 caracteres").max(128),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? "Error al registrarse");
        return;
      }
      // Auto login
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      toast.success("¡Cuenta creada!");
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      toast.error("Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center p-4">
      <div className="absolute inset-0 -z-10 gradient-mesh opacity-50" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="mb-6 flex justify-center">
          <I18nLink href="/">
            <Logo />
          </I18nLink>
        </div>

        <div className="glass-strong rounded-2xl p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">{t("name")}</Label>
              <Input
                id="name"
                placeholder="Tu nombre"
                startIcon={<User className="size-4" />}
                error={errors.name?.message}
                {...register("name")}
              />
            </div>
            <div>
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                startIcon={<Mail className="size-4" />}
                error={errors.email?.message}
                {...register("email")}
              />
            </div>
            <div>
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                startIcon={<Lock className="size-4" />}
                error={errors.password?.message}
                {...register("password")}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                startIcon={<Lock className="size-4" />}
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
            </div>

            <Button type="submit" variant="brand" size="lg" className="w-full" loading={loading}>
              {t("submit")}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">{t("terms")}</p>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("haveAccount")}{" "}
            <I18nLink href="/login" className="font-medium text-foreground hover:underline">
              {t("signIn")}
            </I18nLink>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
