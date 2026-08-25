import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui";
import { PageHero } from "@/components/page-hero";
import { MapPinIcon, PhoneIcon, MailIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with JoyB Resort in Zanzibar, minutes from the airport. Questions about rooms, transfers, or your stay; we're happy to help.",
};

const MAPS_URL =
  "https://www.google.com/maps/place/6%C2%B012'28.1%22S+39%C2%B012'55.2%22E/@-6.2073833,39.2152714,17z/data=!4m4!3m3!8m2!3d-6.2078099!4d39.2153358?hl=en&entry=ttu&g_ep=EgoyMDI2MDcxMy4wIKXMDSoASAFQAw%3D%3D";

const DETAILS = [
  {
    icon: MapPinIcon,
    label: "Address",
    lines: ["Minutes from Zanzibar Airport", "Zanzibar, Tanzania"],
    href: MAPS_URL,
  },
  {
    icon: PhoneIcon,
    label: "Phone & WhatsApp",
    lines: ["+255 670 117 777"],
    href: "tel:+255670117777",
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
      <PageHero image="/joyb_images/juice-point-courtyard.jpg" alt="JoyB Resort courtyard and fresh juice point" kicker="Contact" title="Let’s plan your stay." description="Questions about rooms, arrival, or your time in Zanzibar? Send us a note and the JoyB team will write back." priority />

      <Section className="py-20 sm:py-28" width="wide">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <Reveal className="border-t border-charcoal/20 pt-8">
            <p className="text-xs font-semibold tracking-[0.22em] text-rust uppercase">Write to us</p>
            <h2 className="mt-3 font-display text-5xl text-charcoal">
              Send a message
            </h2>
            <p className="mt-3 mb-8 text-sm text-ink-soft">
              Just the basics, name, email, and your message, are required.
            </p>
            <ContactForm />
          </Reveal>

          <Reveal delay={120} className="flex flex-col gap-6">
            <ul className="grid gap-5">
              {DETAILS.map((d) => (
                <li
                  key={d.label}
                  className="flex items-start gap-4 border-t border-charcoal/15 py-5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-green/10 text-green">
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
            <div className="overflow-hidden border border-charcoal/10">
              <iframe
                src="https://maps.google.com/maps?q=-6.2078099,39.2153358&output=embed&z=16"
                width="100%"
                height="260"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="JoyB Resort location on Google Maps"
              />
              <a
                href={MAPS_URL}
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
