"use client";

import { useState } from "react";

export function CopyUid({ uid }: { uid: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="num -my-1 min-h-8 text-lg font-semibold text-accent"
      aria-label={`Copy UID ${uid}`}
      onClick={async () => {
        await navigator.clipboard.writeText(uid).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? "UID copied" : `UID ${uid}`}
    </button>
  );
}
