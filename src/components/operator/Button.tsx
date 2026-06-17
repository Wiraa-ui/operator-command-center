import { Link, type LinkProps } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-[14px] font-medium op-button-hover";

const styles: Record<Variant, string> = {
  primary:
    "bg-op-accent text-op-bg border-2 border-op-accent hover:shadow-[0_0_24px_-4px_var(--color-op-accent-glow)]",
  ghost:
    "bg-transparent text-op-text border border-op-line hover:bg-op-surface-2 hover:border-op-accent",
};

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

type LinkButtonProps = LinkProps & {
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

export function LinkButton({
  variant = "primary",
  className = "",
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <Link className={`${base} ${styles[variant]} ${className}`} {...(rest as any)}>
      {children}
    </Link>
  );
}

type AnchorButtonProps = ComponentProps<"a"> & {
  variant?: Variant;
  children: ReactNode;
};

export function AnchorButton({
  variant = "primary",
  className = "",
  children,
  ...rest
}: AnchorButtonProps) {
  return (
    <a className={`${base} ${styles[variant]} ${className}`} {...rest}>
      {children}
    </a>
  );
}
