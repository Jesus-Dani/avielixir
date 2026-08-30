"use client";

import { useEffect, useId, useState } from "react";

export function ImageUploadTile({
  name,
  multiple,
  onFilesChange,
}: {
  /** Form field name, for plain <form action={serverAction}> submission. */
  name?: string;
  multiple?: boolean;
  /** For controlled use (e.g. uploading via a browser client before a fetch call) instead of a form field. */
  onFilesChange?: (files: File[]) => void;
}) {
  const inputId = useId();
  const [previews, setPreviews] = useState<{ url: string; name: string }[]>([]);

  // Object URLs are only valid for this session; release them on change/unmount.
  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setPreviews((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return files.map((f) => ({ url: URL.createObjectURL(f), name: f.name }));
    });
    onFilesChange?.(files);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {previews.map((p, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- local blob: preview, not an optimizable remote image
        <img
          key={i}
          src={p.url}
          alt={p.name}
          className="h-20 w-20 shrink-0 rounded-md border border-border object-cover"
        />
      ))}
      <label
        htmlFor={inputId}
        aria-label={multiple ? "Choose image files to upload" : "Choose an image file to upload"}
        className="flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-border bg-bg-soft text-ink-soft transition-colors hover:border-mauve-deep hover:text-mauve-deep"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      </label>
      <input
        id={inputId}
        type="file"
        name={name}
        accept="image/*"
        multiple={multiple}
        className="sr-only"
        onChange={handleChange}
      />
    </div>
  );
}
