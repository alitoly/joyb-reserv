import Image from "next/image";
import { Reveal } from "./reveal";

export function PageHero({
  image,
  alt,
  kicker,
  title,
  description,
  priority = false,
}: {
  image: string;
  alt: string;
  kicker: string;
  title: string;
  description?: string;
  priority?: boolean;
}) {
  return (
    <section className="relative isolate -mt-24 flex min-h-[68svh] items-end overflow-hidden bg-charcoal">
      <Image src={image} alt={alt} fill priority={priority} sizes="100vw" className="-z-10 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-charcoal/50 via-charcoal/10 to-charcoal/90" />
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 pb-14 sm:px-8 sm:pb-20 lg:grid-cols-[1fr_22rem] lg:items-end">
        <Reveal>
          <p className="text-xs font-semibold tracking-[0.3em] text-gold uppercase">{kicker}</p>
          <h1 className="mt-4 max-w-5xl text-[clamp(4rem,10vw,8.5rem)] leading-[0.84] text-white">{title}</h1>
        </Reveal>
        {description && <Reveal delay={100}><p className="border-t border-white/35 pt-5 text-sm leading-7 text-white/75">{description}</p></Reveal>}
      </div>
    </section>
  );
}
