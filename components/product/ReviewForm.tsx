"use client";

import { useState } from "react";

export function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, rating, comment }),
    });
    if (res.ok) {
      setStatus("sent");
      setComment("");
    } else {
      const body = await res.json().catch(() => ({}));
      setErrorMessage(body.error ?? "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <p className="mt-4 rounded-md bg-bg-soft px-4 py-3 text-sm text-ink-soft">
        Thanks! Your review has been submitted and is awaiting approval.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4 rounded-md border border-border p-5">
      <div>
        <label className="eyebrow block text-ink-soft">Your Rating</label>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} star`}
              className={n <= rating ? "text-gold" : "text-border"}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="comment" className="eyebrow block text-ink-soft">Comment (optional)</label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
        />
      </div>
      {status === "error" && <p className="text-sm text-red-600">{errorMessage}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-full bg-mauve-deep px-6 py-2 text-sm font-medium text-white hover:bg-mauve-deep-2 disabled:opacity-60"
      >
        {status === "sending" ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
