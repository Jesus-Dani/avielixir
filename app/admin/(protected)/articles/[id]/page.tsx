import Image from "next/image";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateArticle, deleteArticle, uploadArticleCoverImage } from "@/lib/admin-actions";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ErrorBanner } from "@/components/admin/ErrorBanner";

export default async function EditArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = createAdminClient();
  const { data: article } = await supabase.from("article").select("*").eq("id", id).single();

  if (!article) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-ink">{article.title}</h1>
      <ErrorBanner message={error} />

      <section className="mt-6">
        <p className="eyebrow text-mauve">Cover Image</p>
        {article.cover_image_url && (
          <div className="relative mt-2 aspect-video w-full max-w-sm overflow-hidden rounded-md bg-bg-soft">
            <Image src={article.cover_image_url} alt="" fill sizes="400px" className="object-cover" />
          </div>
        )}
        <form action={uploadArticleCoverImage} className="mt-3 flex items-center gap-2">
          <input type="hidden" name="id" value={article.id} />
          <input type="file" name="file" accept="image/*" required className="text-sm" />
          <SubmitButton pendingText="Uploading..." className="rounded-full bg-mauve-deep px-4 py-1.5 text-xs text-white">
            Upload
          </SubmitButton>
        </form>
      </section>

      <form action={updateArticle} className="mt-8 space-y-4">
        <input type="hidden" name="id" value={article.id} />
        <div>
          <label htmlFor="title" className="eyebrow block text-ink-soft">Title</label>
          <input id="title" name="title" defaultValue={article.title} required className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="excerpt" className="eyebrow block text-ink-soft">Excerpt</label>
          <textarea id="excerpt" name="excerpt" defaultValue={article.excerpt ?? ""} rows={2} className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="content" className="eyebrow block text-ink-soft">Content</label>
          <textarea id="content" name="content" defaultValue={article.content} rows={14} required className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="status" className="eyebrow block text-ink-soft">Status</label>
          <select id="status" name="status" defaultValue={article.status} className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <SubmitButton className="rounded-full bg-mauve-deep px-6 py-2.5 text-sm font-medium text-white hover:bg-mauve-deep-2" pendingText="Saving...">
          Save Changes
        </SubmitButton>
      </form>

      <form action={deleteArticle} className="mt-4">
        <input type="hidden" name="id" value={article.id} />
        <SubmitButton
          confirmMessage={`Delete "${article.title}"? This can't be undone.`}
          pendingText="Deleting..."
          className="text-sm text-red-600 underline"
        >
          Delete Article
        </SubmitButton>
      </form>
    </div>
  );
}
