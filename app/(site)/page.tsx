import { Hero } from "@/components/home/Hero";
import { FeaturedScents } from "@/components/home/FeaturedScents";
import { CollectionsShowcase } from "@/components/home/CollectionsShowcase";
import { BrandStory } from "@/components/home/BrandStory";
import { getFeaturedProducts, getCollections } from "@/lib/queries";

export const revalidate = 60;

export default async function Home() {
  const [products, collections] = await Promise.all([getFeaturedProducts(), getCollections()]);

  return (
    <>
      <Hero />
      <FeaturedScents products={products} />
      <CollectionsShowcase collections={collections} />
      <BrandStory />
    </>
  );
}
