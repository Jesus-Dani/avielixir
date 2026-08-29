"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminAuthenticated } from "@/lib/admin-auth";

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Unauthorized");
  }
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Postgres foreign-key-violation code, thrown when a delete is blocked by a referencing row. */
const FK_VIOLATION = "23503";

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

// --- Category ---
export async function createCategory(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const name = String(formData.get("name") ?? "");
  await supabase.from("category").insert({ name, slug: slugify(name) });
  revalidatePath("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("category").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/categories");
  if (error) {
    redirectWithError(
      "/admin/categories",
      error.code === FK_VIOLATION ? "Can't delete: one or more products still use this category." : error.message
    );
  }
}

// --- Collection ---
export async function createCollection(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const name = String(formData.get("name") ?? "");
  const image_url = String(formData.get("image_url") ?? "") || null;
  await supabase.from("collection").insert({ name, slug: slugify(name), image_url });
  revalidatePath("/admin/collections");
}

export async function updateCollectionImage(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  const image_url = String(formData.get("image_url") ?? "");
  await supabase.from("collection").update({ image_url }).eq("id", id);
  revalidatePath("/admin/collections");
}

export async function deleteCollection(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("collection").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/collections");
  if (error) redirectWithError("/admin/collections", error.message);
}

// --- Product ---
export async function createProduct(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
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

  const collectionIds = formData.getAll("collection_ids").map(String);
  if (collectionIds.length > 0) {
    await supabase
      .from("product_collection")
      .insert(collectionIds.map((collection_id) => ({ product_id: data.id, collection_id })));
  }

  const imageFiles = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const path = `${data.id}/${Date.now()}-${i}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file);
    if (uploadError) continue;
    const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(path);
    await supabase.from("product_image").insert({ product_id: data.id, url: publicUrlData.publicUrl, sort_order: i });
  }

  redirect(`/admin/products/${data.id}`);
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
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
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  const next = formData.get("next") === "true";
  await supabase.from("product").update({ is_featured: next }).eq("id", id);
  revalidatePath("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  const { error } = await supabase.from("product").delete().eq("id", id);
  revalidatePath("/admin/products");

  if (error) {
    redirectWithError(
      `/admin/products/${id}`,
      error.code === FK_VIOLATION
        ? "Can't delete: this product has order history. Set its status to Hidden instead."
        : error.message
    );
  }

  redirect("/admin/products");
}

export async function setProductCollections(productId: string, collectionIds: string[]) {
  await requireAdmin();
  const supabase = createAdminClient();
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
  await requireAdmin();
  const supabase = createAdminClient();
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
  await requireAdmin();
  const supabase = createAdminClient();
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
  await requireAdmin();
  const supabase = createAdminClient();
  const product_id = String(formData.get("product_id"));
  const { error } = await supabase.from("product_variant").delete().eq("id", String(formData.get("id")));
  revalidatePath(`/admin/products/${product_id}`);
  if (error) {
    redirectWithError(
      `/admin/products/${product_id}`,
      error.code === FK_VIOLATION ? "Can't delete: this size has order history." : error.message
    );
  }
}

// --- Product Image ---
export async function uploadProductImage(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const productId = String(formData.get("product_id"));
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return;

  const { count } = await supabase
    .from("product_image")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  let nextSortOrder = count ?? 0;
  let failures = 0;
  for (const file of files) {
    const path = `${productId}/${Date.now()}-${nextSortOrder}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file);
    if (uploadError) {
      failures++;
      continue;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    await supabase.from("product_image").insert({ product_id: productId, url: data.publicUrl, sort_order: nextSortOrder });
    nextSortOrder++;
  }

  revalidatePath(`/admin/products/${productId}`);
  if (failures > 0) {
    redirectWithError(
      `/admin/products/${productId}`,
      failures === files.length ? "Image upload failed. Please try again." : `${failures} of ${files.length} images failed to upload.`
    );
  }
}

export async function uploadCollectionImage(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
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
  await requireAdmin();
  const supabase = createAdminClient();
  const product_id = String(formData.get("product_id"));
  const { error } = await supabase.from("product_image").delete().eq("id", String(formData.get("id")));
  revalidatePath(`/admin/products/${product_id}`);
  if (error) redirectWithError(`/admin/products/${product_id}`, error.message);
}

// --- Orders ---
export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));

  if (status === "paid") {
    // Atomic: decrements variant stock and flips status, only if still pending_payment
    // (guards against double-decrementing stock if an order is already paid).
    const { error } = await supabase.rpc("complete_order_payment", { p_order_id: id, p_reference: `manual:${id}` });
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/orders");
    if (error) redirectWithError(`/admin/orders/${id}`, error.message);
    return;
  }

  await supabase.from("order").update({ status }).eq("id", id);
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}

// --- Reviews ---
export async function moderateReview(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await supabase.from("review").update({ status }).eq("id", id);
  revalidatePath("/admin/reviews");
}

// --- Articles ---
export async function createArticle(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const title = String(formData.get("title") ?? "");
  const status = formData.get("status") === "published" ? "published" : "draft";

  const { data, error } = await supabase
    .from("article")
    .insert({
      title,
      slug: slugify(title),
      excerpt: String(formData.get("excerpt") ?? "") || null,
      content: String(formData.get("content") ?? ""),
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? "Could not create article");
  redirect(`/admin/articles/${data.id}`);
}

export async function updateArticle(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  const status = formData.get("status") === "published" ? "published" : "draft";

  const { data: existing } = await supabase.from("article").select("status, published_at").eq("id", id).single();

  await supabase
    .from("article")
    .update({
      title: String(formData.get("title") ?? ""),
      excerpt: String(formData.get("excerpt") ?? "") || null,
      content: String(formData.get("content") ?? ""),
      status,
      published_at: status === "published" ? (existing?.published_at ?? new Date().toISOString()) : existing?.published_at ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath(`/admin/articles/${id}`);
  revalidatePath("/admin/articles");
  revalidatePath("/journal");
}

export async function deleteArticle(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  const { error } = await supabase.from("article").delete().eq("id", id);
  revalidatePath("/admin/articles");
  if (error) redirectWithError(`/admin/articles/${id}`, error.message);
  redirect("/admin/articles");
}

export async function uploadArticleCoverImage(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  const file = formData.get("file") as File;
  if (!file || file.size === 0) return;

  const path = `articles/${id}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file);
  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  await supabase.from("article").update({ cover_image_url: data.publicUrl }).eq("id", id);
  revalidatePath(`/admin/articles/${id}`);
  revalidatePath("/journal");
}
