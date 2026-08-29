"use client";

import { useId, useState } from "react";

export function ImageUploadTile({ name, multiple }: { name: string; multiple?: boolean }) {
  const inputId = useId();
  const [fileNames, setFileNames] = useState<string[]>([]);

  return (
    <div className="flex items-center gap-3">
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
        onChange={(e) => setFileNames(Array.from(e.target.files ?? []).map((f) => f.name))}
      />
      {fileNames.length > 0 && (
        <span className="text-sm text-ink-soft">
          {fileNames.length === 1 ? fileNames[0] : `${fileNames.length} files selected`}
        </span>
      )}
    </div>
  );
}
