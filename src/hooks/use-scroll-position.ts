"use client";

import { useEffect, useState } from "react";

export function useScrollPosition() {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => setScroll(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return scroll;
}
