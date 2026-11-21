import type { HTMLAttributes } from "react";

type SurfaceProps = HTMLAttributes<HTMLElement> & {
  as?: "section" | "div" | "article" | "aside";
  pad?: "none" | "sm" | "md";
};

const PADS = { none: "", sm: "p-4", md: "p-4 sm:p-6" };

export function Surface({ as: Tag = "section", pad = "md", className = "", children, ...rest }: SurfaceProps) {
  return (
    <Tag className={`rounded-lg border border-line bg-surface shadow-raise ${PADS[pad]} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
