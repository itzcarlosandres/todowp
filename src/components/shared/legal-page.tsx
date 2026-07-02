import { Shield, FileText, Cookie, Undo2, HelpCircle, type LucideIcon } from "lucide-react";
import { Section } from "@/components/shared/section";

const iconMap: Record<string, LucideIcon> = {
  terms: FileText,
  privacy: Shield,
  cookies: Cookie,
  refund: Undo2,
  faq: HelpCircle,
  about: Shield,
};

interface LegalPageProps {
  children: React.ReactNode;
  icon: string;
  title: string;
  updated: string;
}

export function LegalPage({ children, icon, title, updated }: LegalPageProps) {
  const Icon = iconMap[icon] ?? FileText;

  return (
    <Section containerSize="narrow" spacing="lg">
      <div className="mb-10 flex items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-500/10">
          <Icon className="size-6 text-brand-500" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{updated}</p>
        </div>
      </div>

      <div className="space-y-6">
        {children}
      </div>
    </Section>
  );
}

interface LegalSectionProps {
  label?: string;
  title: string;
  children: React.ReactNode;
}

export function LegalSection({ label, title, children }: LegalSectionProps) {
  return (
    <div className="group rounded-2xl border border-border/40 bg-card p-6 transition-colors hover:border-border/60">
      <div className="mb-3 flex items-center gap-2">
        {label && (
          <span className="rounded-md bg-brand-500/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand-500">
            {label}
          </span>
        )}
        <h2 className="text-base font-bold">{title}</h2>
      </div>
      <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}
