"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Scroll-reveal wrapper. Content is visible by default (CSS handles the hidden
 * state only under prefers-reduced-motion: no-preference), so it never ships
 * blank on headless renderers or reduced-motion users. The IntersectionObserver
 * simply flips a data attribute the CSS transitions on.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  as?: "div" | "li" | "article" | "section";
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 30 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 1,
        delay: delay / 1000,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      },
    );
  }, { dependencies: [delay], scope: ref, revertOnUpdate: true });

  return (
    <Tag
      // @ts-expect-error — ref type is the union of the allowed tags
      ref={ref}
      className={className}
    >
      {children}
    </Tag>
  );
}
