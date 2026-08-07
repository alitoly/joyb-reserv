import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { PhotoGrid } from "@/components/photo-grid";
import { Kicker, Section } from "@/components/ui";
import { PalmIcon, BedIcon } from "@/components/icons";


export const revalidate = 300;

const heroImg = "/joyb_images/garden-lawn.jpg";

/**
 * What guests actually get, in the order it matters. Sizes and offsets differ
 * on purpose so this reads as a composition, not three equal cards.
 */
const FACILITIES = [
  {
    src: "/joyb_images/pool-loungers.jpg",
    alt: "Loungers with rolled towels along the pool, waterfall running at the far end",
    title: "The pool",
    body: "A full length pool in the middle of the garden, with loungers, towels, and a waterfall at the shallow end.",
    className: "md:col-span-7",
    ratio: "sm:aspect-[4/3]",
  },
  {
    src: "/joyb_images/restaurant-night.jpg",
    alt: "The open air restaurant at night, wicker pendant lights over wooden tables",
    title: "Restaurant and juice point",
    body: "Breakfast under the thatch, Swahili cooking through the day, and a juice bar pressing whatever is ripe that morning.",
    className: "md:col-span-5 md:mt-16",
    ratio: "sm:aspect-[4/5]",
  },
  {
    src: "/joyb_images/garden-lawn.jpg",
    alt: "Lawn and young palms running from the room doors down to the poolside",
    title: "The garden",
    body: "Mango trees, palms, and shaded corners with swing seats. The lawn runs right up to the room doors.",
    className: "md:col-span-8 md:col-start-4",
    ratio: "sm:aspect-[16/9]",
  },
];

/**
 * Six photographs at three different scales rather than a uniform tile grid.
 * The first runs the full width of the container, then the set alternates
 * between a tall frame and a wide one so the eye moves at a changing pace.
 * Spans total twelve on every row, so nothing is ever orphaned.
 */
const GALLERY = [
  {
    src: "/joyb_images/night-pool.jpg",
    alt: "The pool lit turquoise and violet after dark, warm light in the room doorways",
    className: "col-span-2 aspect-[4/3] sm:col-span-12 sm:aspect-[21/9]",
  },
  {
    src: "/joyb_images/juice-point.jpg",
    alt: "The Fresh Juice Point counter painted with fruit, sun loungers in front",
    className: "col-span-2 aspect-[4/3] sm:col-span-5 sm:aspect-[4/5]",
  },
  {
    src: "/joyb_images/poolside-rooms.jpg",
    alt: "Coral stone room fronts with red shutters opening onto the pool terrace",
    className: "col-span-2 aspect-[4/3] sm:col-span-7 sm:aspect-auto",
  },
  {
    src: "/joyb_images/restaurant-pergola.jpg",
    alt: "Wooden tables under the restaurant pergola, shaded by mango trees",
    className: "col-span-2 aspect-[4/3] sm:col-span-7 sm:aspect-auto",
  },
  {
    src: "/joyb_images/dhow-courtyard.jpg",
    alt: "A carved wooden dhow resting on a painted wave mural in the courtyard",
    className: "col-span-2 aspect-[4/3] sm:col-span-5 sm:aspect-[4/5]",
  },
  {
    src: "/joyb_images/safari-mural.jpg",
    alt: "Hand painted safari mural behind a coral rock water feature",
    className: "col-span-2 aspect-[4/3] sm:col-span-12 sm:aspect-[21/9]",
  },
];

const FEATURES = [
  {
    icon: PalmIcon,
    title: "A garden, a pool, and shade",
    body: "Lawns, mango trees, and a full length pool at the centre of it. JoyB is a calm, green pocket in the heart of the island, minutes from the airport.",
  },
  {
    icon: BedIcon,
    title: "Rooms made for rest",
    body: "Every room has its own bathroom with a rain shower, plus AC or fan, a fridge, a kettle, and linen kept crisp. Designed for calm, not clutter.",
  },
];

export default async function HomePage() {
  return (
    <>
      {/* Hero: the header sits on top of this, so the section starts at the
          very top of the page and the scrim has to carry the nav too. */}
      <section className="relative isolate -mt-20 flex min-h-[100dvh] items-end justify-center overflow-hidden">
        <Image
          src={heroImg}
          alt="The lawn at JoyB Resort, young palms running down to the poolside under old mango trees"
          fill
          priority
          sizes="100vw"
          className="animate-settle -z-10 object-cover object-center"
        />
        {/*
          Measured, not guessed. This frame runs 50 to 66 percent blown
          highlights across its top fifth (pale sky, white building) and close
          to zero across its bottom quarter (lawn in shade). White type in the
          middle of the frame measured 1.5:1 against those highlights, and no
          uniform scrim fixes that without flattening the whole picture. So the
          type sits low over the grass, and the scrim is weighted to match:
          light across the top where the photograph is worth seeing, heavy
          across the bottom where the words are.
        */}
        <div className="absolute inset-0 -z-10 bg-charcoal/12" aria-hidden="true" />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-charcoal/35 from-0% via-charcoal/5 via-35% to-charcoal/90 to-100%"
          aria-hidden="true"
        />

        {/* No button here on purpose. The header's own Book now sits directly
            above it in high contrast, and dropping the duplicate lets the type
            fall into the part of the frame that can actually carry it. */}
        <div className="w-full px-5 pt-28 pb-16 text-center sm:px-8 sm:pb-20">
          <h1 className="display-xl font-display text-[clamp(3rem,10.5vw,8rem)] text-white">
            JoyB Resort
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm tracking-[0.2em] text-white/85 uppercase sm:text-base">
            A garden in the heart of Zanzibar
          </p>
        </div>
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
              <div className="flex h-12 w-12 items-center justify-center bg-green/10 text-green">
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

      {/* What's here */}
      <Section className="pb-20 sm:pb-28">
        <Reveal className="max-w-2xl">
          <h2 className="text-[clamp(2rem,4vw,3rem)] leading-tight text-charcoal">
            More than a place to sleep
          </h2>
          <p className="mt-4 leading-relaxed text-ink-soft">
            Most of the day at JoyB happens outside your room. Here is what you
            walk out into.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-x-8 gap-y-14 md:grid-cols-12">
          {FACILITIES.map((f, i) => (
            <Reveal as="div" key={f.src} delay={i * 90} className={f.className}>
              <div
                className={`relative aspect-[4/3] overflow-hidden bg-sand-deep ${f.ratio}`}
              >
                <Image
                  src={f.src}
                  alt={f.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="object-cover"
                />
              </div>
              <h3 className="mt-6 font-display text-2xl text-charcoal">
                {f.title}
              </h3>
              <p className="mt-2 max-w-md leading-relaxed text-ink-soft">
                {f.body}
              </p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Gallery */}
      <Section className="pb-24 sm:pb-36">
        <Reveal className="mb-12 max-w-3xl sm:mb-16">
          <Kicker>The resort</Kicker>
          <h2 className="mt-5 text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.02] text-charcoal">
            A calm place to call home
          </h2>
        </Reveal>

        <Reveal>
          <PhotoGrid
            photos={GALLERY}
            className="grid grid-cols-2 gap-3 sm:grid-cols-12 sm:gap-4"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 60vw, 55vw"
          />
        </Reveal>
      </Section>
    </>
  );
}
