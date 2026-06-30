"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { ButtonLink } from "./ui";
import { createBrowserSupabase, isAuthConfigured } from "@/lib/supabase-auth";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/rooms", label: "Rooms" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

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

  return (
    <header
      className={`sticky top-0 z-[var(--z-header)] transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-charcoal/10 bg-sand/90 backdrop-blur"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Logo />

        <nav aria-label="Primary" className="hidden md:block">
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
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                      active
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

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href={authLink.href}
            className="rounded-full px-4 py-2 text-sm font-medium text-charcoal/70 transition-colors duration-200 hover:text-charcoal"
          >
            {authLink.label}
          </Link>
          <ButtonLink href="/book" variant="primary">
            Book now
          </ButtonLink>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-charcoal md:hidden cursor-pointer"
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
                    className={`block rounded-xl px-4 py-3 text-base font-medium ${
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
                className="block rounded-xl px-4 py-3 text-base font-medium text-charcoal/80 hover:bg-sand-deep"
              >
                {authLink.label}
              </Link>
            </li>
            <li className="pt-2">
              <ButtonLink
                href="/book"
                variant="primary"
                className="w-full"
                onClick={() => setOpen(false)}
              >
                Book now
              </ButtonLink>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
