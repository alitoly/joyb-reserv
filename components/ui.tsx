import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "gold" | "outline" | "light";

const base =
  "inline-flex items-center justify-center gap-3 border px-6 py-3 text-[0.62rem] font-bold tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary:
    "border-charcoal bg-charcoal text-white hover:border-rust hover:bg-rust focus-visible:outline-rust",
  gold: "border-gold bg-gold text-charcoal hover:border-charcoal hover:bg-charcoal hover:text-white focus-visible:outline-gold-strong",
  outline:
    "border border-charcoal/25 bg-transparent text-charcoal hover:border-rust hover:bg-rust hover:text-white focus-visible:outline-rust",
  // For controls sitting on photography, where brand color would disappear.
  light:
    "border-sand bg-sand text-charcoal hover:border-white hover:bg-white focus-visible:outline-white",
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
    <span className="editorial-label text-rust">{children}</span>
  );
}
