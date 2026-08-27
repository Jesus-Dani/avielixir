export default function ContactPage() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <p className="eyebrow text-mauve">Contact</p>
      <h1 className="font-display mt-2 text-4xl text-ink">We&rsquo;re Here to Help</h1>
      <p className="mt-4 text-ink-soft">
        Questions about an order, a scent, or delivery? The fastest way to reach us is WhatsApp.
      </p>
      {number ? (
        <a
          href={`https://wa.me/${number}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block rounded-full bg-[#25D366] px-8 py-3 text-sm font-medium text-white hover:opacity-90"
        >
          Chat on WhatsApp
        </a>
      ) : (
        <p className="mt-8 text-sm text-ink-soft">WhatsApp contact coming soon.</p>
      )}
    </div>
  );
}
