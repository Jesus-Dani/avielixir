import { createAdminClient } from "@/lib/supabase/admin";
import { createCategory, deleteCategory } from "@/lib/admin-actions";

export default async function AdminCategoriesPage() {
  const supabase = createAdminClient();
  const { data: categories } = await supabase.from("category").select("*").order("name");

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Categories</h1>

      <form action={createCategory} className="mt-6 flex max-w-md gap-2">
        <input name="name" required placeholder="Category name" className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm" />
        <button type="submit" className="rounded-full bg-mauve-deep px-5 py-2 text-sm text-white hover:bg-mauve-deep-2">Add</button>
      </form>

      <ul className="mt-8 divide-y divide-border border-y border-border">
        {(categories ?? []).map((cat) => (
          <li key={cat.id} className="flex items-center justify-between py-3">
            <span className="text-ink">{cat.name}</span>
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={cat.id} />
              <button type="submit" className="text-sm text-ink-soft hover:text-red-600">Delete</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
