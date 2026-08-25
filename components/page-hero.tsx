import Image from "next/image";
import type { ReactNode } from "react";
import { Reveal } from "./reveal";

export function PageHero({
  image,
  alt,
  title,
  priority = false,
}: {
  image: string;
  alt: string;
  title: ReactNode;
  priority?: boolean;
}) {
  return (
    <section className="relative isolate -mt-24 flex min-h-[76svh] items-end overflow-hidden bg-charcoal">
      <Image src={image} alt={alt} fill priority={priority} sizes="100vw" className="-z-10 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-charcoal/35 via-transparent to-charcoal/80" />
      <div className="mx-auto w-full max-w-[100rem] px-5 pb-14 sm:px-8 sm:pb-20">
        <Reveal>
          <h1 className="max-w-6xl text-[clamp(4.4rem,11.5vw,10.5rem)] leading-[0.76] text-white">{title}</h1>
        </Reveal>
      </div>
    </section>
  );
}
