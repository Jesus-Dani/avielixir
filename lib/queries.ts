import { createClient } from "@/lib/supabase/server";
import type { Article, Category, Collection, Product } from "@/lib/types";

const PRODUCT_SELECT = "*, category:category_id(*), variants:product_variant(*), images:product_image(*)";

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product")
    .select(PRODUCT_SELECT)
    .eq("status", "active")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(4);

  if (error) {
    console.error("getFeaturedProducts", error.message);
    return [];
  }
  return (data ?? []) as unknown as Product[];
}

export async function getCollections(): Promise<Collection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("collection").select("*").order("name");
  if (error) {
    console.error("getCollections", error.message);
    return [];
  }
  return data ?? [];
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("category").select("*").order("name");
  if (error) {
    console.error("getCategories", error.message);
    return [];
  }
  return data ?? [];
}

export async function getProducts(filters: {
  categorySlug?: string;
  collectionSlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
} = {}): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase.from("product").select(PRODUCT_SELECT).eq("status", "active");

  if (filters.categorySlug) {
    const { data: cat } = await supabase.from("category").select("id").eq("slug", filters.categorySlug).single();
    if (!cat) return [];
    query = query.eq("category_id", cat.id);
  }

  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) {
    console.error("getProducts", error.message);
    return [];
  }

  let products = (data ?? []) as unknown as Product[];

  // Each size has its own price, so "matches the price range" means at least one of its sizes does.
  if (filters.minPrice != null) {
    products = products.filter((p) => p.variants?.some((v) => v.price >= filters.minPrice!));
  }
  if (filters.maxPrice != null) {
    products = products.filter((p) => p.variants?.some((v) => v.price <= filters.maxPrice!));
  }

  if (filters.collectionSlug) {
    const { data: coll } = await supabase.from("collection").select("id").eq("slug", filters.collectionSlug).single();
    if (!coll) return [];
    const { data: links } = await supabase
      .from("product_collection")
      .select("product_id")
      .eq("collection_id", coll.id);
    const ids = new Set((links ?? []).map((l) => l.product_id));
    products = products.filter((p) => ids.has(p.id));
  }

  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !data) return null;
  return data as unknown as Product;
}

export async function getRelatedProducts(product: Product): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product")
    .select(PRODUCT_SELECT)
    .eq("status", "active")
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .limit(4);

  if (error) return [];
  return (data ?? []) as unknown as Product[];
}

export async function getPublishedArticles(): Promise<Article[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("article")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("getPublishedArticles", error.message);
    return [];
  }
  return data ?? [];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("article")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) return null;
  return data;
}
