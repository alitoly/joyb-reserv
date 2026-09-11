"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { createBrowserSupabase, isAuthConfigured } from "@/lib/supabase-auth";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/rooms", label: "Rooms" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/**
 * Routes that open with a full-bleed photograph. Only these can carry a
 * transparent header with light type; everywhere else the page starts on sand
 * and the header has to be solid from the first pixel or the links vanish.
 */
const HERO_PAGES = new Set(["/", "/rooms", "/about", "/gallery", "/contact"]);

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Reflect auth state in the header (Sign in ↔ Account). Set state only from
  // async callbacks, never synchronously in the effect body.
  useEffect(() => {
    if (!isAuthConfigured) return;
    const supabase = createBrowserSupabase();
    supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setSignedIn(Boolean(session?.user)),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const authLink = signedIn
    ? { href: "/account", label: "My account" }
    : { href: "/login", label: "Sign in" };

  // Light type on the photograph, dark type once the page scrolls onto sand.
  const overHero = HERO_PAGES.has(pathname) && !scrolled && !open;

  return (
    <header
      className={`sticky top-0 z-[var(--z-header)] transition-all duration-500 ${
        overHero
          ? "bg-transparent"
          : "border-b border-charcoal/10 bg-sand/90 backdrop-blur"
      }`}
    >
      {/* Full width, not centred in a container: the mark sits against the
          left edge of the viewport the way the reference does. */}
      <div className={`grid w-full grid-cols-[1fr_auto] items-center gap-4 px-5 transition-[padding] duration-500 sm:px-8 md:grid-cols-[1fr_auto_1fr] ${scrolled ? "py-2" : "py-4"}`}>
        <Logo className={overHero ? "text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]" : "text-charcoal"} />

        <nav aria-label="Primary" className="hidden justify-center md:flex">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`editorial-link mx-3 px-0 ${
                      overHero
                        ? active
                          ? "text-white"
                          : "text-white/75 hover:text-white"
                        : active
                          ? "text-green"
                          : "text-charcoal/70 hover:text-charcoal"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto hidden items-center gap-6 md:flex">
          <Link
            href={authLink.href}
            className={`editorial-link ${
              overHero
                ? "text-white/75 hover:text-white"
                : "text-charcoal/70 hover:text-charcoal"
            }`}
          >
            {authLink.label}
          </Link>
          <Link href="/book" className={`editorial-link ${overHero ? "text-white" : "text-charcoal"}`}>Book your stay <span className="ml-2 text-rust">↗</span></Link>
          <Image
            src="/joyb-logo.png"
            alt="JoyB Resort"
            width={64}
            height={51}
            className={`h-10 w-auto object-contain ${overHero ? "drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]" : ""}`}
          />
        </div>

        <div className="ml-auto flex items-center gap-3 md:hidden">
          <Image
            src="/joyb-logo.png"
            alt="JoyB Resort"
            width={64}
            height={51}
            className={`h-9 w-auto object-contain ${overHero ? "drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]" : ""}`}
          />
          <button
            type="button"
            className={`inline-flex h-11 w-11 items-center justify-center cursor-pointer ${
              overHero ? "text-white" : "text-charcoal"
            }`}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {open ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-charcoal/10 bg-sand md:hidden"
        >
          <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`block px-4 py-3 text-base font-medium ${
 active
 ? "bg-sand-deep text-green"
 : "text-charcoal/80 hover:bg-sand-deep"
 }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href={authLink.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-base font-medium text-charcoal/80 hover:bg-sand-deep"
              >
                {authLink.label}
              </Link>
            </li>
            <li className="pt-2">
              <Link href="/book" onClick={() => setOpen(false)} className="block border border-charcoal bg-charcoal px-5 py-4 text-center text-[0.62rem] font-bold tracking-[0.2em] text-white uppercase">Book your stay</Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
