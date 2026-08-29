import Image from "next/image";
import Link from "next/link";
import { getPublishedArticles } from "@/lib/queries";
import { PageHeader } from "@/components/layout/PageHeader";

export const revalidate = 60;

export default async function JournalPage() {
  const articles = await getPublishedArticles();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader eyebrow="Journal" title="Stories & Scents" />

      {articles.length === 0 ? (
        <p className="mt-8 text-ink-soft">No articles yet. Check back soon.</p>
      ) : (
        <div className="mt-10 grid gap-10 sm:grid-cols-2">
          {articles.map((article) => (
            <Link key={article.id} href={`/journal/${article.slug}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-bg-soft">
                {article.cover_image_url && (
                  <Image
                    src={article.cover_image_url}
                    alt={article.title}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <p className="mt-4 text-xs text-ink-soft">
                {article.published_at && new Date(article.published_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
              </p>
              <h2 className="font-display mt-1 text-2xl text-ink group-hover:text-mauve-deep">{article.title}</h2>
              {article.excerpt && <p className="mt-2 text-sm text-ink-soft">{article.excerpt}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
