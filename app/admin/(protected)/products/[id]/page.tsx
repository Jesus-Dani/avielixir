import Image from "next/image";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  updateProduct,
  deleteProduct,
  createVariant,
  updateVariant,
  deleteVariant,
  uploadProductImage,
  deleteProductImage,
  updateProductCollectionsAction,
} from "@/lib/admin-actions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: product }, { data: categories }, { data: collections }, { data: productCollections }] = await Promise.all([
    supabase.from("product").select("*, variants:product_variant(*), images:product_image(*)").eq("id", id).single(),
    supabase.from("category").select("*").order("name"),
    supabase.from("collection").select("*").order("name"),
    supabase.from("product_collection").select("collection_id").eq("product_id", id),
  ]);

  if (!product) notFound();

  const selectedCollectionIds = new Set((productCollections ?? []).map((pc) => pc.collection_id));

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-ink">{product.name}</h1>

      <form action={updateProduct} className="mt-8 space-y-4">
        <input type="hidden" name="id" value={product.id} />
        <div>
          <label htmlFor="name" className="eyebrow block text-ink-soft">Name</label>
          <input id="name" name="name" defaultValue={product.name} required className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="category_id" className="eyebrow block text-ink-soft">Category</label>
          <select id="category_id" name="category_id" defaultValue={product.category_id} required className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm">
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="base_price" className="eyebrow block text-ink-soft">Base Price (₦)</label>
          <input id="base_price" name="base_price" type="number" step="1" defaultValue={product.base_price} required className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="scent_notes" className="eyebrow block text-ink-soft">Scent Notes</label>
          <textarea id="scent_notes" name="scent_notes" defaultValue={product.scent_notes ?? ""} rows={2} className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="usage_instructions" className="eyebrow block text-ink-soft">Usage Instructions</label>
          <textarea id="usage_instructions" name="usage_instructions" defaultValue={product.usage_instructions ?? ""} rows={2} className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="status" className="eyebrow block text-ink-soft">Status</label>
          <select id="status" name="status" defaultValue={product.status} className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm">
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" name="is_featured" defaultChecked={product.is_featured} /> Featured on homepage
        </label>
        <button type="submit" className="rounded-full bg-mauve-deep px-6 py-2.5 text-sm font-medium text-white hover:bg-mauve-deep-2">
          Save Changes
        </button>
      </form>

      <form action={deleteProduct} className="mt-4">
        <input type="hidden" name="id" value={product.id} />
        <button type="submit" className="text-sm text-red-600 underline">Delete Product</button>
      </form>

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="font-display text-xl text-ink">Collections</h2>
        <form action={updateProductCollectionsAction} className="mt-4 space-y-2">
          <input type="hidden" name="product_id" value={product.id} />
          {(collections ?? []).map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm text-ink-soft">
              <input type="checkbox" name="collection_ids" value={c.id} defaultChecked={selectedCollectionIds.has(c.id)} />
              {c.name}
            </label>
          ))}
          <button type="submit" className="rounded-full border border-border px-5 py-1.5 text-sm text-ink-soft hover:border-mauve-deep">
            Save Collections
          </button>
        </form>
      </section>

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="font-display text-xl text-ink">Sizes & Stock</h2>
        <ul className="mt-4 space-y-3">
          {(product.variants ?? []).map((v: { id: string; size_label: string; price: number | null; stock_quantity: number }) => (
            <li key={v.id} className="flex flex-wrap items-center gap-2">
              <form action={updateVariant} className="flex flex-1 flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={v.id} />
                <input type="hidden" name="product_id" value={product.id} />
                <input name="size_label" defaultValue={v.size_label} className="w-24 rounded-md border border-border bg-surface px-2 py-1 text-sm" />
                <input name="price" type="number" defaultValue={v.price ?? ""} placeholder={`base: ${product.base_price}`} className="w-28 rounded-md border border-border bg-surface px-2 py-1 text-sm" />
                <input name="stock_quantity" type="number" defaultValue={v.stock_quantity} className="w-20 rounded-md border border-border bg-surface px-2 py-1 text-sm" />
                <button type="submit" className="rounded-full border border-border px-3 py-1 text-xs text-ink-soft hover:border-mauve-deep">Save</button>
              </form>
              <form action={deleteVariant}>
                <input type="hidden" name="id" value={v.id} />
                <input type="hidden" name="product_id" value={product.id} />
                <button type="submit" className="text-xs text-red-600">Delete</button>
              </form>
            </li>
          ))}
        </ul>
        <form action={createVariant} className="mt-4 flex flex-wrap items-center gap-2">
          <input type="hidden" name="product_id" value={product.id} />
          <input name="size_label" placeholder="e.g. 50ml" required className="w-24 rounded-md border border-border bg-surface px-2 py-1 text-sm" />
          <input name="price" type="number" placeholder="Price (optional)" className="w-32 rounded-md border border-border bg-surface px-2 py-1 text-sm" />
          <input name="stock_quantity" type="number" placeholder="Stock" defaultValue={0} className="w-20 rounded-md border border-border bg-surface px-2 py-1 text-sm" />
          <button type="submit" className="rounded-full bg-mauve-deep px-4 py-1.5 text-xs text-white">Add Size</button>
        </form>
      </section>

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="font-display text-xl text-ink">Images</h2>
        <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-4">
          {(product.images ?? []).map((img: { id: string; url: string }) => (
            <div key={img.id} className="relative">
              <div className="relative aspect-square overflow-hidden rounded-md bg-bg-soft">
                <Image src={img.url} alt="" fill sizes="150px" className="object-cover" />
              </div>
              <form action={deleteProductImage} className="mt-1">
                <input type="hidden" name="id" value={img.id} />
                <input type="hidden" name="product_id" value={product.id} />
                <button type="submit" className="text-xs text-red-600">Remove</button>
              </form>
            </div>
          ))}
        </div>
        <form action={uploadProductImage} className="mt-4 flex items-center gap-2">
          <input type="hidden" name="product_id" value={product.id} />
          <input type="file" name="file" accept="image/*" required className="text-sm" />
          <button type="submit" className="rounded-full bg-mauve-deep px-4 py-1.5 text-xs text-white">Upload</button>
        </form>
      </section>
    </div>
  );
}
