import Image from "next/image";
import Link from "next/link";
import type { Collection } from "@/lib/types";

export function CollectionsShowcase({ collections }: { collections: Collection[] }) {
  if (collections.length === 0) return null;

  return (
    <section className="bg-mauve-deep py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="eyebrow text-gold-soft">Explore Our</p>
        <h2 className="font-display mt-2 max-w-md text-3xl sm:text-4xl">Collections</h2>
        <p className="mt-4 max-w-md text-white/70">Discover fragrances for every mood, memory and moment.</p>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {collections.map((collection) => (
            <Link key={collection.id} href={`/collections/${collection.slug}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-mauve-deep-2">
                {collection.image_url && (
                  <Image
                    src={collection.image_url}
                    alt={collection.name}
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="font-display text-xl">{collection.name}</p>
                  <p className="eyebrow mt-1 text-gold-soft">Shop Now &rarr;</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
