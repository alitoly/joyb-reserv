"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/reservations", label: "Reservations" },
  { href: "/admin/manage", label: "Manage (calendar)" },
];

/** Sub-navigation shared by the admin pages. */
export function AdminNav({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Admin"
      className={`flex flex-wrap gap-2 ${className}`}
    >
      {LINKS.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={` px-4 py-2 text-sm font-medium transition-colors ${
 active
 ? "bg-green text-white"
 : "bg-surface text-charcoal ring-1 ring-charcoal/15 hover:ring-green"
 }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
