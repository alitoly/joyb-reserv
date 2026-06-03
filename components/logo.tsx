import Link from "next/link";

/**
 * JoyB Resort wordmark. A simple sun-over-water mark in the brand gold/green,
 * paired with the name. Placeholder mark — swap for the real logo later.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="JoyB Resort — home"
      className={`group inline-flex items-center gap-2.5 ${className}`}
    >
      <svg
        width="34"
        height="34"
        viewBox="0 0 34 34"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <circle cx="17" cy="14" r="7" fill="var(--color-gold)" />
        <path
          d="M3 24c3.2 0 3.2 2 6.4 2s3.2-2 6.4-2 3.2 2 6.4 2 3.2-2 6.4-2"
          stroke="var(--color-green)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M3 29c3.2 0 3.2 2 6.4 2s3.2-2 6.4-2 3.2 2 6.4 2 3.2-2 6.4-2"
          stroke="var(--color-green)"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
      <span className="font-display text-xl leading-none tracking-tight text-charcoal">
        JoyB <span className="text-green">Resort</span>
      </span>
    </Link>
  );
}
