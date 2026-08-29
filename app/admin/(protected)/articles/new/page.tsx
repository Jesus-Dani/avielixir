import { createArticle } from "@/lib/admin-actions";
import { SubmitButton } from "@/components/admin/SubmitButton";

export default function NewArticlePage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-ink">New Article</h1>
      <form action={createArticle} className="mt-8 space-y-4">
        <div>
          <label htmlFor="title" className="eyebrow block text-ink-soft">Title</label>
          <input id="title" name="title" required className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="excerpt" className="eyebrow block text-ink-soft">Excerpt</label>
          <textarea id="excerpt" name="excerpt" rows={2} placeholder="Short summary shown on the Journal listing page" className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="content" className="eyebrow block text-ink-soft">Content</label>
          <textarea id="content" name="content" rows={12} required className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="status" className="eyebrow block text-ink-soft">Status</label>
          <select id="status" name="status" defaultValue="draft" className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <SubmitButton className="rounded-full bg-mauve-deep px-6 py-2.5 text-sm font-medium text-white hover:bg-mauve-deep-2" pendingText="Creating...">
          Create Article
        </SubmitButton>
      </form>
      <p className="mt-4 text-xs text-ink-soft">You can add a cover image after creating the article.</p>
    </div>
  );
}
