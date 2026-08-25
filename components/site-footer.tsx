import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="overflow-hidden bg-rust text-charcoal">
      <div className="px-5 py-8 sm:px-8">
        <div className="flex items-center justify-between border-t border-charcoal/50 pt-4 editorial-label">
          <Logo />
          <span>Zanzibar · Tanzania</span>
        </div>
        <div className="py-24 sm:py-36">
          <p className="editorial-label mb-8">Your Zanzibar stay</p>
          <Link href="/rooms" className="group flex items-end justify-between border-b-2 border-charcoal pb-3 font-display text-[clamp(4rem,11vw,10.5rem)] leading-[0.82] tracking-[-0.065em]">
            Come as you are.<span className="pb-2 font-sans text-3xl transition-transform duration-300 group-hover:-translate-y-2 group-hover:translate-x-2 sm:text-5xl">↗</span>
          </Link>
        </div>
        <div className="flex flex-col gap-5 border-t border-charcoal/50 pt-4 editorial-label sm:flex-row sm:items-center sm:justify-between">
          <a href="mailto:reservation@joybresort.com">reservation@joybresort.com</a>
          <a href="tel:+255670117777">+255 670 117 777</a>
          <span>© {new Date().getFullYear()} JoyB Resort</span>
        </div>
      </div>
    </footer>
  );
}
