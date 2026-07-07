import { Link } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Magnetic } from "@/components/ui/motion/Magnetic";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

type LinkButtonProps = ButtonProps & {
  to: string;
};

type AnchorButtonProps = ButtonProps & {
  href: string;
  target?: string;
  rel?: string;
};

function getVariantStyles(variant: "primary" | "secondary" | "ghost" = "primary") {
  switch (variant) {
    case "primary":
      // Faded-neon fill with an inner top highlight + soft glow on hover.
      return "bg-op-accent text-op-bg shadow-[0_8px_30px_-12px_var(--color-op-accent-glow)] before:absolute before:inset-x-0 before:top-0 before:h-1/2 before:rounded-t-full before:bg-white/15 before:opacity-60 hover:shadow-[0_10px_44px_-10px_var(--color-op-accent-glow)] hover:brightness-[1.06]";
    case "secondary":
      return "bg-op-surface-2/70 text-op-text border border-op-line backdrop-blur-md hover:border-op-accent/50 hover:bg-op-surface-2";
    case "ghost":
      return "text-op-text border border-op-line bg-op-surface/30 backdrop-blur-md hover:border-op-accent/50 hover:bg-op-surface-2/60 hover:text-op-text";
  }
}

const baseStyles =
  "op-button-hover relative isolate inline-flex h-11 items-center justify-center overflow-hidden rounded-full px-6 font-op-mono text-[13px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-op-accent";

export function Button({ children, variant, className, ...props }: ButtonProps) {
  return (
    <Magnetic>
      <button className={cn(baseStyles, getVariantStyles(variant), className)} {...props}>
        <span className="relative z-10 inline-flex items-center gap-1.5">{children}</span>
      </button>
    </Magnetic>
  );
}

export function LinkButton({ children, variant, className, to, ...props }: LinkButtonProps) {
  return (
    <Magnetic>
      <Link to={to} className={cn(baseStyles, getVariantStyles(variant), className)} {...props}>
        <span className="relative z-10 inline-flex items-center gap-1.5">{children}</span>
      </Link>
    </Magnetic>
  );
}

export function AnchorButton({ children, variant, className, href, ...props }: AnchorButtonProps) {
  return (
    <Magnetic>
      <a href={href} className={cn(baseStyles, getVariantStyles(variant), className)} {...props}>
        <span className="relative z-10 inline-flex items-center gap-1.5">{children}</span>
      </a>
    </Magnetic>
  );
}
