import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="JoyB Resort, home"
      className={`group flex w-max flex-col text-current ${className}`}
    >
      <span className="font-display text-[1.75rem] leading-[0.78] tracking-[-0.055em]">JOYB</span>
      <span className="mt-2 text-[0.46rem] font-bold tracking-[0.42em] uppercase">Zanzibar</span>
    </Link>
  );
}
