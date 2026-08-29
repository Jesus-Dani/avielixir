import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminArticlesPage() {
  const supabase = createAdminClient();
  const { data: articles } = await supabase.from("article").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">Articles</h1>
        <Link href="/admin/articles/new" className="rounded-full bg-mauve-deep px-5 py-2 text-sm text-white hover:bg-mauve-deep-2">
          + New Article
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-ink-soft">
              <th className="py-2">Title</th>
              <th className="py-2">Status</th>
              <th className="py-2">Updated</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {(articles ?? []).map((a) => (
              <tr key={a.id} className="border-b border-border">
                <td className="py-3">{a.title}</td>
                <td className="py-3 text-ink-soft capitalize">{a.status}</td>
                <td className="py-3 text-ink-soft">{new Date(a.updated_at).toLocaleDateString()}</td>
                <td className="py-3">
                  <Link href={`/admin/articles/${a.id}`} className="text-mauve-deep underline">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(articles ?? []).length === 0 && <p className="mt-4 text-sm text-ink-soft">No articles yet.</p>}
      </div>
    </div>
  );
}
