"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function ScrollLine({ className = "" }: { className?: string }) {
  const line = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    if (!line.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      line.current,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: line.current,
          start: "top 82%",
          end: "bottom 30%",
          scrub: true,
        },
      },
    );
  });

  return (
    <span
      ref={line}
      aria-hidden="true"
      className={`block h-full w-px origin-top bg-gold ${className}`}
    />
  );
}
