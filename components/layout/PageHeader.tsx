export function PageHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <>
      <p className="eyebrow text-mauve">{eyebrow}</p>
      <h1 className="font-display mt-2 text-4xl text-ink">{title}</h1>
    </>
  );
}
