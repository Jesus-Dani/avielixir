import { adminLogin } from "@/lib/admin-login-action";
import { SubmitButton } from "@/components/admin/SubmitButton";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8">
        <p className="font-display text-2xl text-ink">Avi Elixir Admin</p>
        <p className="mt-1 text-sm text-ink-soft">Enter the admin password to continue.</p>
        <form action={adminLogin} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="eyebrow block text-ink-soft">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-600">Incorrect password. Please try again.</p>}
          <SubmitButton pendingText="Signing in..." className="w-full rounded-full bg-mauve-deep px-6 py-2.5 text-sm font-medium text-white hover:bg-mauve-deep-2">
            Sign In
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
