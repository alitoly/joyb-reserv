import Image from "next/image";
import type { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <section className="mx-auto grid min-h-[calc(100svh-5rem)] w-full max-w-[100rem] lg:grid-cols-[1fr_1.05fr]">
      <div className="relative hidden overflow-hidden bg-green lg:block">
        <Image src="/joyb_images/pool-golden-hour.jpg" alt="JoyB Resort pool and garden in golden evening light" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-charcoal/20" />
        <p className="absolute bottom-10 left-10 max-w-md font-display text-6xl leading-[0.82] text-white">Your Zanzibar stay.</p>
      </div>
      <div className="flex items-center px-5 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </div>
    </section>
  );
}
