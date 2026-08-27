import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { createCollection, deleteCollection, uploadCollectionImage } from "@/lib/admin-actions";

export default async function AdminCollectionsPage() {
  const supabase = await createClient();
  const { data: collections } = await supabase.from("collection").select("*").order("name");

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Collections</h1>

      <form action={createCollection} className="mt-6 grid max-w-md gap-2">
        <input name="name" required placeholder="Collection name" className="rounded-md border border-border bg-surface px-3 py-2 text-sm" />
        <input name="image_url" placeholder="Cover image URL (optional)" className="rounded-md border border-border bg-surface px-3 py-2 text-sm" />
        <button type="submit" className="rounded-full bg-mauve-deep px-5 py-2 text-sm text-white hover:bg-mauve-deep-2">Add Collection</button>
      </form>

      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(collections ?? []).map((col) => (
          <li key={col.id} className="rounded-md border border-border p-4">
            <div className="relative aspect-video overflow-hidden rounded-md bg-bg-soft">
              {col.image_url && <Image src={col.image_url} alt={col.name} fill sizes="300px" className="object-cover" />}
            </div>
            <p className="mt-2 font-medium text-ink">{col.name}</p>

            <form action={uploadCollectionImage} className="mt-2 flex items-center gap-2">
              <input type="hidden" name="id" value={col.id} />
              <input type="file" name="file" accept="image/*" className="text-xs" />
              <button type="submit" className="rounded-full border border-border px-3 py-1 text-xs text-ink-soft hover:border-mauve-deep">
                Upload
              </button>
            </form>

            <form action={deleteCollection} className="mt-2">
              <input type="hidden" name="id" value={col.id} />
              <button type="submit" className="text-xs text-ink-soft hover:text-red-600">Delete</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
