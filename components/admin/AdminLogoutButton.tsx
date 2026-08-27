import { adminLogout } from "@/lib/admin-login-action";

export function AdminLogoutButton() {
  return (
    <form action={adminLogout}>
      <button type="submit" className="text-sm text-ink-soft underline hover:text-mauve-deep">
        Sign Out
      </button>
    </form>
  );
}
