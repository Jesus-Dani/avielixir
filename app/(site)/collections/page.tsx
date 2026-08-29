import Image from "next/image";
import Link from "next/link";
import { getCollections } from "@/lib/queries";
import { PageHeader } from "@/components/layout/PageHeader";

export const revalidate = 60;

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader eyebrow="Explore Our" title="Collections" />
      <p className="mt-3 max-w-md text-ink-soft">Discover fragrances for every mood, memory and moment.</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <Link key={collection.id} href={`/collections/${collection.slug}`} className="group block">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-bg-soft">
              {collection.image_url && (
                <Image
                  src={collection.image_url}
                  alt={collection.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="font-display text-xl">{collection.name}</p>
                <p className="eyebrow mt-1 text-gold-soft">Shop Now &rarr;</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
