import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "gold" | "outline" | "light";

const base =
  "inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold tracking-wide transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary:
    "bg-green text-white hover:bg-green-strong focus-visible:outline-green-strong",
  gold: "bg-gold text-charcoal hover:bg-gold-strong focus-visible:outline-gold-strong",
  outline:
    "border border-charcoal/20 bg-transparent text-charcoal hover:border-green hover:text-green focus-visible:outline-green",
  // For controls sitting on photography, where brand color would disappear.
  light:
    "bg-sand text-charcoal hover:bg-white focus-visible:outline-white",
};

export function buttonClass(variant: Variant = "primary", extra = "") {
  return `${base} ${variants[variant]} ${extra}`;
}

/** Anchor-style call to action that navigates with the App Router. */
export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
  ...rest
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, "href" | "className">) {
  return (
    <Link href={href} className={buttonClass(variant, className)} {...rest}>
      {children}
    </Link>
  );
}

/** Native button for forms / handlers. */
export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: {
  variant?: Variant;
  className?: string;
  children: ReactNode;
} & ComponentProps<"button">) {
  return (
    <button className={buttonClass(variant, className)} {...rest}>
      {children}
    </button>
  );
}

/** Section wrapper with consistent max width + fluid vertical rhythm. */
export function Section({
  children,
  className = "",
  width = "default",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  width?: "default" | "narrow" | "wide";
} & ComponentProps<"section">) {
  const max =
    width === "narrow"
      ? "max-w-3xl"
      : width === "wide"
        ? "max-w-7xl"
        : "max-w-6xl";
  return (
    <section
      className={`mx-auto w-full ${max} px-5 sm:px-8 ${className}`}
      {...rest}
    >
      {children}
    </section>
  );
}

/** Small label that names a section without the overused tracked eyebrow. */
export function Kicker({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-semibold text-rust">
      <span className="h-px w-6 bg-rust" aria-hidden="true" />
      {children}
    </span>
  );
}
