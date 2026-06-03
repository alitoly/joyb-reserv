import type { SVGProps } from "react";

/** Lucide-style line icons (24x24, currentColor). */
const props = (p: SVGProps<SVGSVGElement>) => ({
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...p,
});

export function WaveIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props(p)}>
      <path d="M2 6c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2" />
      <path d="M2 12c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2" />
      <path d="M2 18c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2" />
    </svg>
  );
}

export function BedIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props(p)}>
      <path d="M2 18V8a2 2 0 0 1 2-2h12a4 4 0 0 1 4 4v8" />
      <path d="M2 13h20" />
      <path d="M6 10h4" />
      <path d="M2 18v2M22 18v2" />
    </svg>
  );
}

export function CalendarIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props(p)}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  );
}

export function PalmIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props(p)}>
      <path d="M12 21V10" />
      <path d="M12 10c-3-3-7-2-9 0 2.5-.5 4 .5 5 2" />
      <path d="M12 10c3-3 7-2 9 0-2.5-.5-4 .5-5 2" />
      <path d="M12 10c0-4 2-7 5-8-1.5 2-1.5 4-1 6" />
      <path d="M12 10c0-4-2-7-5-8 1.5 2 1.5 4 1 6" />
    </svg>
  );
}

export function CheckIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props(p)}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function AlertIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props(p)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}

export function SpinnerIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props(p)} className={`animate-spin ${p.className ?? ""}`}>
      <path d="M21 12a9 9 0 1 1-6.2-8.5" />
    </svg>
  );
}

export function MapPinIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props(p)}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function PhoneIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props(p)}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
    </svg>
  );
}

export function MailIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props(p)}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 6 10-6" />
    </svg>
  );
}
