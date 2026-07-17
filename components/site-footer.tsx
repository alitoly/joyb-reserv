import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-charcoal/10 bg-charcoal text-sand">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="[&_span]:text-sand [&_.text-green]:text-gold">
            <Logo />
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-sand/70">
            A quiet garden retreat in the heart of Zanzibar, minutes from the
            airport. Warm Swahili hospitality and 17 comfortable rooms.
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="font-display text-lg text-sand">Explore</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { href: "/rooms", label: "Rooms & rates" },
              { href: "/book", label: "Book your stay" },
              { href: "/about", label: "Our story" },
              { href: "/contact", label: "Contact us" },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sand/70 transition-colors hover:text-gold"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-lg text-sand">Find us</h2>
          <address className="mt-4 space-y-2 text-sm not-italic text-sand/70">
            <p>
              <a
                href="https://www.google.com/maps/place/6%C2%B012'28.1%22S+39%C2%B012'55.2%22E/@-6.2073833,39.2152714,17z/data=!4m4!3m3!8m2!3d-6.2078099!4d39.2153358?hl=en&entry=ttu&g_ep=EgoyMDI2MDcxMy4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold"
              >
                Minutes from Zanzibar Airport
              </a>
            </p>
            <p>Zanzibar, Tanzania</p>
            <p>
              <a className="hover:text-gold" href="tel:+255670117777">
                +255 670 117 777
              </a>
            </p>
            <p>
              <a className="hover:text-gold" href="mailto:reservation@joybresort.com">
                reservation@joybresort.com
              </a>
            </p>
          </address>
        </div>
      </div>

      <div className="border-t border-sand/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-sand/50 sm:flex-row sm:px-8">
          <p>© {new Date().getFullYear()} JoyB Resort. All rights reserved.</p>
          <p>Zanzibar · Tanzania</p>
        </div>
      </div>
    </footer>
  );
}
