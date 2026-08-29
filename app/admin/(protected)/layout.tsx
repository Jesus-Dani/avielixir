import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/reviews", label: "Reviews" },
];

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 md:flex-row md:gap-8 md:py-10 lg:px-8">
      <aside className="border-b border-border pb-4 md:w-48 md:shrink-0 md:border-b-0 md:pb-0">
        <div className="flex items-center justify-between md:block">
          <p className="font-display text-lg text-ink">Admin</p>
          <div className="md:hidden">
            <AdminLogoutButton />
          </div>
        </div>
        <nav className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm md:mt-6 md:flex-col md:gap-2">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-ink-soft hover:text-mauve-deep">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 hidden md:block">
          <AdminLogoutButton />
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
