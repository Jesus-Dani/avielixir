"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const STORAGE_KEY = "avi-elixir-privacy-consent";

export function PrivacyGate() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage requires a client-only effect
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // localStorage unavailable (private mode etc.) — let the visitor through rather than error.
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [visible]);

  function accept() {
    if (!agreed) return;
    try {
      localStorage.setItem(STORAGE_KEY, "agreed");
    } catch {}
    setVisible(false);
    router.push("/");
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-gate-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/70 px-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-lg bg-surface p-6 shadow-xl sm:p-8">
        <p className="eyebrow text-mauve">Before You Continue</p>
        <h2 id="privacy-gate-title" className="font-display mt-2 text-2xl text-ink">
          Your Privacy Matters to Us
        </h2>
        <p className="mt-4 text-sm text-ink-soft">
          Avi Elixir uses cookies and collects the information described in our Privacy Policy to run this site and
          process your orders. Please review it before continuing.
        </p>
        <label className="mt-5 flex items-start gap-3 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-mauve-deep"
          />
          <span>
            I have read and agree to the{" "}
            <Link href="/privacy" target="_blank" className="text-mauve-deep underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" target="_blank" className="text-mauve-deep underline">
              Terms of Service
            </Link>
            .
          </span>
        </label>
        <button
          onClick={accept}
          disabled={!agreed}
          className="mt-6 w-full rounded-full bg-mauve-deep px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-mauve-deep-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Agree &amp; Continue
        </button>
      </div>
    </div>
  );
}
