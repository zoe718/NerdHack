import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-ink hover:brightness-95 disabled:bg-surface-2 disabled:text-fg-2",
  secondary: "border border-line bg-surface text-fg hover:bg-surface-2 disabled:text-fg-2",
  ghost: "text-fg hover:bg-surface-2 disabled:text-fg-2",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-11 px-4 text-sm",
  md: "h-12 px-5 text-base",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", block = false): string {
  return [
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-semibold whitespace-nowrap",
    "transition-colors duration-150 disabled:cursor-not-allowed",
    VARIANTS[variant],
    SIZES[size],
    block ? "w-full" : "",
  ].join(" ");
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  icon?: ReactNode;
};

export function Button({ variant, size, block, icon, className = "", type = "button", children, ...rest }: ButtonProps) {
  return (
    <button type={type} className={`${buttonClass(variant, size, block)} ${className}`} {...rest}>
      {icon}
      {children}
    </button>
  );
}
