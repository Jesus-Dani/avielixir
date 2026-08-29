import Link from "next/link";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All Perfumes" },
      { href: "/shop?featured=1", label: "Best Sellers" },
    ],
  },
  {
    title: "Collections",
    links: [
      { href: "/collections/floral", label: "Floral" },
      { href: "/collections/woody-warm", label: "Woody & Warm" },
      { href: "/collections/fresh-fruity", label: "Fresh & Fruity" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/about", label: "Our Story" },
      { href: "/journal", label: "Journal" },
      { href: "/shipping", label: "Shipping & Delivery" },
      { href: "/returns", label: "Returns Policy" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/contact", label: "Contact Us" },
      { href: "/shipping", label: "Shipping Info" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-mauve-deep-2 text-white/90">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-5 lg:px-8">
        <div className="md:col-span-1">
          <p className="font-display text-lg tracking-[0.2em]">AVI ELIXIR</p>
          <p className="mt-2 text-sm text-white/60">Scents that define you.</p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="eyebrow text-gold-soft">{col.title}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/70 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 px-4 py-6 text-xs text-white/50 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Avi Elixir. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
