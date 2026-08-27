import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProducts } from "@/lib/queries";
import { ProductCard } from "@/components/product/ProductCard";

export const revalidate = 60;

export default async function CollectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: collection } = await supabase.from("collection").select("*").eq("slug", slug).single();

  if (!collection) notFound();

  const products = await getProducts({ collectionSlug: slug });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="eyebrow text-mauve">Collection</p>
      <h1 className="font-display mt-2 text-4xl text-ink">{collection.name}</h1>

      {products.length === 0 ? (
        <p className="mt-8 text-ink-soft">No products in this collection yet.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
