"use client";

import { useCallback, useState } from "react";

export function useCopy(resetDelay = 1500) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      if (typeof navigator === "undefined" || !navigator.clipboard) return false;
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), resetDelay);
        return true;
      } catch {
        return false;
      }
    },
    [resetDelay],
  );

  return { copied, copy };
}
