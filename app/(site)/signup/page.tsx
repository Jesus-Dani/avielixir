"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function SignupFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(next ?? "/account");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-20 sm:px-6">
      <h1 className="font-display text-3xl text-ink">Create Account</h1>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="name" className="eyebrow block text-ink-soft">Full Name</label>
          <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="email" className="eyebrow block text-ink-soft">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="password" className="eyebrow block text-ink-soft">Password</label>
          <input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={pending} className="w-full rounded-full bg-mauve-deep px-6 py-2.5 text-sm font-medium text-white hover:bg-mauve-deep-2 disabled:opacity-60">
          {pending ? "Creating account..." : "Create Account"}
        </button>
      </form>
      <p className="mt-6 text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="text-mauve-deep underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupFormInner />
    </Suspense>
  );
}
