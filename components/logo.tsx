import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="JoyB Resort, home"
      className={`group inline-flex items-end gap-2 text-current ${className}`}
    >
      <span className="font-display text-[1.8rem] leading-none tracking-[-0.06em]">JoyB</span>
      <span className="mb-0.5 h-2 w-2 rounded-full bg-gold transition-transform duration-300 group-hover:scale-150" aria-hidden="true" />
      <span className="mb-0.5 hidden text-[0.56rem] font-bold tracking-[0.2em] uppercase sm:inline">Zanzibar</span>
    </Link>
  );
}
