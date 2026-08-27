"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "avi-elixir-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage requires client-only effect
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // localStorage unavailable (private mode etc.) — skip banner rather than error.
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface px-4 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-ink-soft">
          We use cookies to improve your experience on Avi Elixir. By continuing to browse, you agree to our{" "}
          <a href="/privacy" className="underline">Privacy Policy</a>.
        </p>
        <button
          onClick={dismiss}
          className="shrink-0 rounded-full bg-mauve-deep px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-mauve-deep-2"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
