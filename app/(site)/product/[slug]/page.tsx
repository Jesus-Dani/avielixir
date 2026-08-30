import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ReviewsSection } from "@/components/product/ReviewsSection";
import { ProductCard } from "@/components/product/ProductCard";

export const revalidate = 60;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-12 md:grid-cols-2">
        <ProductGallery images={product.images ?? []} productName={product.name} />
        <ProductDetail product={product} />
      </div>

      <ReviewsSection productId={product.id} productSlug={product.slug} />

      {related.length > 0 && (
        <section className="mt-16 border-t border-border pt-10">
          <h2 className="font-display text-2xl text-ink">You May Also Like</h2>
          <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
