"use client";

import { useTranslations } from "next-intl";
import { Logo } from "@/components/shared/logo";
import { Container } from "@/components/shared/container";
import { Separator } from "@/components/ui/separator";
import { Link as I18nLink } from "@/i18n/routing";
import Link from "next/link";
import { Github, Twitter, Linkedin, Instagram, Youtube, Mail } from "lucide-react";

const socialLinks = [
  { href: "https://github.com", icon: Github, label: "GitHub" },
  { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
  { href: "https://linkedin.com", icon: Linkedin, label: "LinkedIn" },
  { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
  { href: "https://youtube.com", icon: Youtube, label: "YouTube" },
];

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <Container>
        <div className="grid gap-8 py-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              {t("newsletter.description")}
            </p>

            <div className="mt-6 flex items-center gap-2">
              {socialLinks.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={s.label}
                    className="flex size-9 items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold">{t("products")}</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <I18nLink href="/products" className="text-muted-foreground hover:text-foreground">
                  {t("products")}
                </I18nLink>
              </li>
              <li>
                <Link href="/products?type=THEME" className="text-muted-foreground hover:text-foreground">
                  {t("themes")}
                </Link>
              </li>
              <li>
                <Link href="/products?type=PLUGIN" className="text-muted-foreground hover:text-foreground">
                  {t("plugins")}
                </Link>
              </li>
              <li>
                <Link href="/products?type=TEMPLATE" className="text-muted-foreground hover:text-foreground">
                  {t("templates")}
                </Link>
              </li>
              <li>
                <Link href="/products?type=SCRIPT" className="text-muted-foreground hover:text-foreground">
                  {t("scripts")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">{t("company")}</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <I18nLink href="/blog" className="text-muted-foreground hover:text-foreground">
                  {t("blog")}
                </I18nLink>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  {t("careers")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  {t("press")}
                </Link>
              </li>
              <li>
                <a href="mailto:contact@marketflow.dev" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                  <Mail className="size-3" /> {t("contact")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">{t("support")}</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  {t("help")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  {t("documentation")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  {t("api")}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  {t("status")}
                </Link>
              </li>
              <li>
                <I18nLink href="/dashboard" className="text-muted-foreground hover:text-foreground">
                  {t("licenses")}
                </I18nLink>
              </li>
            </ul>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
          <p className="text-xs text-muted-foreground">
            © {year} MarketFlow. {t("rights")}.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <Link href="#" className="hover:text-foreground">{t("terms")}</Link>
            <Link href="#" className="hover:text-foreground">{t("privacy")}</Link>
            <Link href="#" className="hover:text-foreground">{t("cookies")}</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
