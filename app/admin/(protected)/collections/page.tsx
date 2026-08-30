import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/admin";
import { createCollection, deleteCollection, uploadCollectionImage } from "@/lib/admin-actions";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ErrorBanner } from "@/components/admin/ErrorBanner";
import { ImageUploadTile } from "@/components/ui/ImageUploadTile";

export default async function AdminCollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = createAdminClient();
  const { data: collections } = await supabase.from("collection").select("*").order("name");

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Collections</h1>
      <ErrorBanner message={error} />

      <form action={createCollection} className="mt-6 grid max-w-md gap-2">
        <input name="name" required placeholder="Collection name" className="rounded-md border border-border bg-surface px-3 py-2 text-sm" />
        <input name="image_url" placeholder="Cover image URL (optional)" className="rounded-md border border-border bg-surface px-3 py-2 text-sm" />
        <SubmitButton className="rounded-full bg-mauve-deep px-5 py-2 text-sm text-white hover:bg-mauve-deep-2" pendingText="Adding...">
          Add Collection
        </SubmitButton>
      </form>

      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(collections ?? []).map((col) => (
          <li key={col.id} className="rounded-md border border-border p-4">
            <div className="relative aspect-video overflow-hidden rounded-md bg-bg-soft">
              {col.image_url && <Image src={col.image_url} alt={col.name} fill sizes="300px" className="object-cover" />}
            </div>
            <p className="mt-2 font-medium text-ink">{col.name}</p>

            <form action={uploadCollectionImage} className="mt-2 flex flex-wrap items-center gap-2">
              <input type="hidden" name="id" value={col.id} />
              <ImageUploadTile name="file" />
              <SubmitButton
                pendingText="Uploading..."
                className="rounded-full border border-border px-3 py-1 text-xs text-ink-soft hover:border-mauve-deep"
              >
                Upload
              </SubmitButton>
            </form>

            <form action={deleteCollection} className="mt-2">
              <input type="hidden" name="id" value={col.id} />
              <SubmitButton
                confirmMessage={`Delete the "${col.name}" collection? This can't be undone.`}
                pendingText="Deleting..."
                className="text-xs text-ink-soft hover:text-red-600"
              >
                Delete
              </SubmitButton>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
