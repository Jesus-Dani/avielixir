"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    eyebrow: "Scents that",
    headline: "Define You",
    body: "Exquisite fragrances, crafted with intention. Made to be remembered.",
    cta: { href: "/collections", label: "Explore Collections" },
  },
  {
    eyebrow: "New in",
    headline: "Campus Favorites",
    body: "Affordable scents built for every lecture hall, hangout, and first date.",
    cta: { href: "/shop?featured=1", label: "Shop Bestsellers" },
  },
  {
    eyebrow: "Every mood,",
    headline: "Every Moment",
    body: "From fresh mornings to warm nights — find the fragrance for right now.",
    cta: { href: "/shop", label: "Shop All Scents" },
  },
];

export function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);

  const slide = SLIDES[index];

  return (
    <section className="relative flex min-h-[560px] items-center overflow-hidden bg-mauve-deep text-white sm:min-h-[680px]">
      <Image
        src="/images/hero.jpg"
        alt="A woman surrounded by hands holding Avi Elixir fragrance bottles"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-mauve-deep-2/90 via-mauve-deep-2/40 to-mauve-deep-2/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-mauve-deep-2/70 via-transparent to-transparent" />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="eyebrow text-gold-soft">{slide.eyebrow}</p>
        <h1 className="font-display mt-3 max-w-xl text-5xl leading-tight sm:text-6xl">{slide.headline}</h1>
        <div className="mt-6 h-px w-16 bg-gold" />
        <p className="mt-6 max-w-md text-white/80">{slide.body}</p>
        <Link
          href={slide.cta.href}
          className="mt-8 inline-block rounded-sm bg-gold-soft px-8 py-3 text-sm font-medium tracking-wide text-mauve-deep-2 transition-colors hover:bg-white"
        >
          {slide.cta.label.toUpperCase()}
        </Link>

        <div className="mt-16 flex items-center gap-3 text-xs text-white/60">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <div className="flex gap-1">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-px w-8 transition-colors ${i === index ? "bg-gold" : "bg-white/30"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
