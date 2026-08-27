"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// --- Category ---
export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "");
  await supabase.from("category").insert({ name, slug: slugify(name) });
  revalidatePath("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("category").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/categories");
}

// --- Collection ---
export async function createCollection(formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "");
  const image_url = String(formData.get("image_url") ?? "") || null;
  await supabase.from("collection").insert({ name, slug: slugify(name), image_url });
  revalidatePath("/admin/collections");
}

export async function updateCollectionImage(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const image_url = String(formData.get("image_url") ?? "");
  await supabase.from("collection").update({ image_url }).eq("id", id);
  revalidatePath("/admin/collections");
}

export async function deleteCollection(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("collection").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/collections");
}

// --- Product ---
export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "");
  const { data, error } = await supabase
    .from("product")
    .insert({
      name,
      slug: slugify(name),
      category_id: String(formData.get("category_id")),
      scent_notes: String(formData.get("scent_notes") ?? "") || null,
      usage_instructions: String(formData.get("usage_instructions") ?? "") || null,
      base_price: Number(formData.get("base_price") ?? 0),
      status: "active",
      is_featured: formData.get("is_featured") === "on",
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? "Could not create product");
  redirect(`/admin/products/${data.id}`);
}

export async function updateProduct(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  await supabase
    .from("product")
    .update({
      name: String(formData.get("name") ?? ""),
      category_id: String(formData.get("category_id")),
      scent_notes: String(formData.get("scent_notes") ?? "") || null,
      usage_instructions: String(formData.get("usage_instructions") ?? "") || null,
      base_price: Number(formData.get("base_price") ?? 0),
      status: formData.get("status") === "hidden" ? "hidden" : "active",
      is_featured: formData.get("is_featured") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/admin/products");
}

export async function toggleFeatured(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const next = formData.get("next") === "true";
  await supabase.from("product").update({ is_featured: next }).eq("id", id);
  revalidatePath("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("product").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function setProductCollections(productId: string, collectionIds: string[]) {
  const supabase = await createClient();
  await supabase.from("product_collection").delete().eq("product_id", productId);
  if (collectionIds.length > 0) {
    await supabase
      .from("product_collection")
      .insert(collectionIds.map((collection_id) => ({ product_id: productId, collection_id })));
  }
  revalidatePath(`/admin/products/${productId}`);
}

export async function updateProductCollectionsAction(formData: FormData) {
  const productId = String(formData.get("product_id"));
  const collectionIds = formData.getAll("collection_ids").map(String);
  await setProductCollections(productId, collectionIds);
}

// --- Product Variant ---
export async function createVariant(formData: FormData) {
  const supabase = await createClient();
  const product_id = String(formData.get("product_id"));
  const priceRaw = formData.get("price");
  await supabase.from("product_variant").insert({
    product_id,
    size_label: String(formData.get("size_label") ?? ""),
    price: priceRaw ? Number(priceRaw) : null,
    stock_quantity: Number(formData.get("stock_quantity") ?? 0),
  });
  revalidatePath(`/admin/products/${product_id}`);
}

export async function updateVariant(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const product_id = String(formData.get("product_id"));
  const priceRaw = formData.get("price");
  await supabase
    .from("product_variant")
    .update({
      size_label: String(formData.get("size_label") ?? ""),
      price: priceRaw ? Number(priceRaw) : null,
      stock_quantity: Number(formData.get("stock_quantity") ?? 0),
    })
    .eq("id", id);
  revalidatePath(`/admin/products/${product_id}`);
}

export async function deleteVariant(formData: FormData) {
  const supabase = await createClient();
  const product_id = String(formData.get("product_id"));
  await supabase.from("product_variant").delete().eq("id", String(formData.get("id")));
  revalidatePath(`/admin/products/${product_id}`);
}

// --- Product Image ---
export async function attachProductImage(productId: string, url: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("product_image")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);
  await supabase.from("product_image").insert({ product_id: productId, url, sort_order: count ?? 0 });
  revalidatePath(`/admin/products/${productId}`);
}

export async function uploadProductImage(formData: FormData) {
  const supabase = await createClient();
  const productId = String(formData.get("product_id"));
  const file = formData.get("file") as File;
  if (!file || file.size === 0) return;

  const path = `${productId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file);
  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  await attachProductImage(productId, data.publicUrl);
}

export async function uploadCollectionImage(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const file = formData.get("file") as File;
  if (!file || file.size === 0) return;

  const path = `collections/${id}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file);
  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  await supabase.from("collection").update({ image_url: data.publicUrl }).eq("id", id);
  revalidatePath("/admin/collections");
}

export async function deleteProductImage(formData: FormData) {
  const supabase = await createClient();
  const product_id = String(formData.get("product_id"));
  await supabase.from("product_image").delete().eq("id", String(formData.get("id")));
  revalidatePath(`/admin/products/${product_id}`);
}

// --- Orders ---
export async function updateOrderStatus(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await supabase.from("order").update({ status }).eq("id", id);
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}

// --- Reviews ---
export async function moderateReview(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await supabase.from("review").update({ status }).eq("id", id);
  revalidatePath("/admin/reviews");
}
