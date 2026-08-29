import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/queries";

export const revalidate = 60;

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  return (
    <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/journal" className="eyebrow text-mauve hover:text-mauve-deep">&larr; Journal</Link>
      <p className="mt-4 text-xs text-ink-soft">
        {article.published_at && new Date(article.published_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
      </p>
      <h1 className="font-display mt-2 text-4xl text-ink">{article.title}</h1>

      {article.cover_image_url && (
        <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-lg bg-bg-soft">
          <Image src={article.cover_image_url} alt={article.title} fill sizes="700px" className="object-cover" priority />
        </div>
      )}

      <div className="mt-8 whitespace-pre-wrap text-ink-soft leading-relaxed">{article.content}</div>
    </article>
  );
}
