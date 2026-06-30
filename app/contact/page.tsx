import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";
import { Kicker, Section } from "@/components/ui";
import { MapPinIcon, PhoneIcon, MailIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with JoyB Resort in Zanzibar, minutes from the airport. Questions about rooms, transfers, or your stay; we're happy to help.",
};

const DETAILS = [
  {
    icon: MapPinIcon,
    label: "Address",
    lines: ["Minutes from Zanzibar Airport", "Zanzibar, Tanzania"],
    href: "https://maps.app.goo.gl/aag3trMGFzyjQMga9",
  },
  {
    icon: PhoneIcon,
    label: "Phone & WhatsApp",
    lines: ["+255 000 000 000"],
    href: "tel:+255000000000",
  },
  {
    icon: MailIcon,
    label: "Email",
    lines: ["reservation@joybresort.com"],
    href: "mailto:reservation@joybresort.com",
  },
];

export default function ContactPage() {
  return (
    <>
      <Section className="pt-16 pb-8 sm:pt-24">
        <Reveal className="max-w-3xl">
          <Kicker>Contact</Kicker>
          <h1 className="mt-4 text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] text-charcoal">
            We'd love to hear from you
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
            Planning a stay, arranging an airport pickup, or just curious about
            the area? Send us a note and a real person will write back.
          </p>
        </Reveal>
      </Section>

      <Section className="pb-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
          <Reveal className="rounded-[2rem] bg-surface p-6 ring-1 ring-charcoal/5 sm:p-9">
            <h2 className="font-display text-2xl text-charcoal">
              Send a message
            </h2>
            <p className="mt-1 mb-6 text-sm text-ink-soft">
              Just the basics, name, email, and your message, are required.
            </p>
            <ContactForm />
          </Reveal>

          <Reveal delay={120} className="flex flex-col gap-6">
            <ul className="grid gap-5">
              {DETAILS.map((d) => (
                <li
                  key={d.label}
                  className="flex items-start gap-4 rounded-2xl bg-surface p-5 ring-1 ring-charcoal/5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green/10 text-green">
                    <d.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-charcoal">
                      {d.label}
                    </p>
                    {d.lines.map((line) => (
                      <p key={line} className="text-ink-soft">
                        {d.href ? (
                          <a
                            href={d.href}
                            className="transition-colors hover:text-green"
                            target={d.href.startsWith("http") ? "_blank" : undefined}
                            rel={d.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          >
                            {line}
                          </a>
                        ) : (
                          line
                        )}
                      </p>
                    ))}
                  </div>
                </li>
              ))}
            </ul>

            {/* Google Maps embed */}
            <div className="overflow-hidden rounded-2xl ring-1 ring-charcoal/5">
              <iframe
                src="https://maps.google.com/maps?q=JoyB+Resort+Zanzibar&output=embed&z=15"
                width="100%"
                height="260"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="JoyB Resort location on Google Maps"
              />
              <a
                href="https://maps.app.goo.gl/aag3trMGFzyjQMga9"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-surface px-4 py-3 text-sm font-medium text-green transition-colors hover:text-green-strong"
              >
                <MapPinIcon className="h-4 w-4" />
                Open in Google Maps
              </a>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
