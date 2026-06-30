import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { ButtonLink, Kicker, Section } from "@/components/ui";
import { PalmIcon, BedIcon } from "@/components/icons";


export const revalidate = 300;

// Neutral placeholder imagery. Swap for real resort photos.
const heroImg =
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=2000&q=80";

// Gallery placeholders — replace with actual resort photos
const GALLERY = [
  {
    src: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80",
    alt: "Lush garden path between tropical plants",
    className: "col-span-2 row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=700&q=80",
    alt: "Calm bright room with a leafy plant and simple chair",
    className: "",
  },
  {
    src: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=700&q=80",
    alt: "Quiet outdoor seating area under palm shade",
    className: "",
  },
  {
    src: "https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=700&q=80",
    alt: "Simple clean room interior",
    className: "",
  },
  {
    src: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=700&q=80",
    alt: "Garden terrace at golden hour",
    className: "",
  },
];

const FEATURES = [
  {
    icon: PalmIcon,
    title: "A quiet garden setting",
    body: "Lawns, palms, and shaded corners to slow down in. JoyB is a calm, green pocket in the heart of the island, minutes from the airport.",
  },
  {
    icon: BedIcon,
    title: "Rooms made for rest",
    body: "17 rooms across four room types, each with a private bathroom, AC or fan, and linen kept crisp. Designed for calm, not clutter.",
  },
];

export default async function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate min-h-[88vh] w-full overflow-hidden">
        <Image
          src={heroImg}
          alt="A broad green tree in a quiet grassy garden under a soft blue sky"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover animate-kenburns"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-charcoal/55 via-charcoal/25 to-charcoal/65"
          aria-hidden="true"
        />
        <Section className="flex min-h-[88vh] flex-col justify-center py-28">
          <div className="max-w-2xl text-sand">
            <p className="font-medium tracking-wide text-gold">
              In the heart of Zanzibar
            </p>
            <h1 className="mt-4 font-display text-[clamp(2.75rem,7vw,5.25rem)] leading-[1.02] text-white">
              A peaceful garden retreat in the heart of Zanzibar
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-sand/90">
              JoyB Resort is a quiet garden guesthouse just minutes from the
              airport, with warm Swahili hospitality and calm, comfortable
              rooms. An easy place to land, rest, and explore the island.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/book" variant="gold" className="px-8">
                Book now
              </ButtonLink>
              <ButtonLink
                href="/rooms"
                variant="outline"
                className="border-sand/40 px-8 text-sand hover:border-sand hover:text-white"
              >
                View rooms
              </ButtonLink>
            </div>
          </div>
        </Section>
      </section>

      {/* Features */}
      <Section className="py-20 sm:py-28">
        <Reveal className="max-w-2xl">
          <Kicker>Why JoyB</Kicker>
          <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] leading-tight text-charcoal">
            Small resort, generous in every way that matters
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-2">
          {FEATURES.map((f, i) => (
            <Reveal as="div" key={f.title} delay={i * 90}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green/10 text-green">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-2xl text-charcoal">
                {f.title}
              </h3>
              <p className="mt-3 leading-relaxed text-ink-soft">{f.body}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Gallery */}
      <Section className="py-12 sm:py-16">
        <Reveal className="mb-10">
          <Kicker>The resort</Kicker>
          <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] leading-tight text-charcoal">
            A calm place to call home
          </h2>
        </Reveal>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {GALLERY.map((img, i) => (
            <Reveal
              key={img.src}
              delay={i * 60}
              className={`relative overflow-hidden rounded-2xl bg-sand-deep ${
                i === 0 ? "col-span-2 row-span-2 aspect-square sm:aspect-auto sm:min-h-[340px]" : "aspect-square"
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </Reveal>
          ))}
        </div>

      </Section>
    </>
  );
}
