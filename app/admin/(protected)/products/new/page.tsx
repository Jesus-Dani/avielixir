import { createAdminClient } from "@/lib/supabase/admin";
import { createProduct } from "@/lib/admin-actions";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ImageUploadTile } from "@/components/admin/ImageUploadTile";

export default async function NewProductPage() {
  const supabase = createAdminClient();
  const [{ data: categories }, { data: collections }] = await Promise.all([
    supabase.from("category").select("*").order("name"),
    supabase.from("collection").select("*").order("name"),
  ]);

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl text-ink">New Product</h1>
      <form action={createProduct} className="mt-8 space-y-4">
        <div>
          <label htmlFor="name" className="eyebrow block text-ink-soft">Name</label>
          <input id="name" name="name" required className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="category_id" className="eyebrow block text-ink-soft">Category</label>
          <select id="category_id" name="category_id" required className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm">
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="base_price" className="eyebrow block text-ink-soft">Base Price (₦)</label>
          <input id="base_price" name="base_price" type="number" step="1" required className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="scent_notes" className="eyebrow block text-ink-soft">Scent Notes</label>
          <textarea id="scent_notes" name="scent_notes" rows={2} className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="usage_instructions" className="eyebrow block text-ink-soft">Usage Instructions</label>
          <textarea id="usage_instructions" name="usage_instructions" rows={2} className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm" />
        </div>
        {(collections ?? []).length > 0 && (
          <div>
            <p className="eyebrow block text-ink-soft">Collections</p>
            <div className="mt-2 space-y-2">
              {(collections ?? []).map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm text-ink-soft">
                  <input type="checkbox" name="collection_ids" value={c.id} />
                  {c.name}
                </label>
              ))}
            </div>
          </div>
        )}
        <div>
          <p className="eyebrow block text-ink-soft">Images</p>
          <div className="mt-2">
            <ImageUploadTile name="images" multiple />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" name="is_featured" /> Featured on homepage
        </label>
        <SubmitButton className="rounded-full bg-mauve-deep px-6 py-2.5 text-sm font-medium text-white hover:bg-mauve-deep-2" pendingText="Creating...">
          Create Product
        </SubmitButton>
      </form>
      <p className="mt-4 text-xs text-ink-soft">
        Sizes and stock are added on the next screen after you create the product.
      </p>
    </div>
  );
}
