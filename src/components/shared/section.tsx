import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  containerSize?: "default" | "narrow" | "wide";
  spacing?: "default" | "sm" | "lg" | "none";
  as?: React.ElementType;
}

export function Section({
  children,
  className,
  containerSize = "default",
  spacing = "default",
  as: Tag = "section",
  ...props
}: SectionProps) {
  const spacings = {
    none: "py-0",
    sm: "py-12 md:py-16",
    default: "py-16 md:py-24",
    lg: "py-20 md:py-32",
  };

  return (
    <Tag className={cn(spacings[spacing], className)} {...props}>
      <div
        className={cn(
          "container-fluid",
          containerSize === "narrow" && "max-w-4xl",
          containerSize === "wide" && "max-w-7xl",
        )}
      >
        {children}
      </div>
    </Tag>
  );
}

export function SectionHeader({
  title,
  subtitle,
  badge,
  align = "left",
  className,
}: {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-2",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {badge && (
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-700 dark:text-brand-300">
          {badge}
        </span>
      )}
      <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="text-pretty max-w-2xl text-base text-muted-foreground md:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
