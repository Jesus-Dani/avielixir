import Image from "next/image";
import Link from "next/link";

export function BrandStory() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-bg-soft">
          <Image
            src="/images/essence.jpg"
            alt="A woman spraying Avi Elixir perfume onto her neck"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="eyebrow text-mauve">Our Essence</p>
          <h2 className="font-display mt-2 text-3xl text-ink sm:text-4xl">
            More than a fragrance. It&rsquo;s an experience.
          </h2>
          <p className="mt-4 max-w-md text-ink-soft">
            At Avi Elixir, we believe every scent tells a story. We source fragrances that evoke confidence,
            spark memory, and leave a lasting impression, without the luxury price tag.
          </p>
          <Link href="/about" className="eyebrow mt-6 inline-flex items-center gap-1 text-mauve-deep hover:text-mauve">
            Discover Our Story <span aria-hidden>&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
