import type { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
  title?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-surface text-foreground border border-foreground shadow-[2px_2px_0px_0px_var(--foreground)]",
  success: "bg-success text-success-foreground border border-foreground shadow-[2px_2px_0px_0px_var(--foreground)]",
  warning: "bg-warning text-warning-foreground border border-foreground shadow-[2px_2px_0px_0px_var(--foreground)]",
  danger: "bg-danger text-danger-foreground border border-foreground shadow-[2px_2px_0px_0px_var(--foreground)]",
  info: "bg-primary text-primary-foreground border border-foreground shadow-[2px_2px_0px_0px_var(--foreground)]",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
};

export default function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  className = "",
  title,
}: BadgeProps) {
  return (
    <span
      title={title}
      className={`
        inline-flex items-center gap-1.5 font-bold rounded-none whitespace-nowrap
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {children}
    </span>
  );
}
