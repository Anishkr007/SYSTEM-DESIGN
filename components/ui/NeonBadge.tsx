import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "primary" | "secondary" | "success" | "warning" | "danger";

interface NeonBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-white/10 text-white border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]",
  primary: "bg-primary/20 text-indigo-300 border-primary/50 shadow-[0_0_10px_rgba(99,102,241,0.3)]",
  secondary: "bg-secondary/20 text-cyan-300 border-secondary/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]",
  success: "bg-green-500/20 text-green-300 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.3)]",
  warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.3)]",
  danger: "bg-red-500/20 text-red-300 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]",
};

export default function NeonBadge({ children, variant = "default", className }: NeonBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
