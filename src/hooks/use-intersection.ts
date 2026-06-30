"use client";

import { useEffect, useRef, useState } from "react";

export function useIntersection<T extends Element>(options: IntersectionObserverInit = {}) {
  const ref = useRef<T | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry?.isIntersecting ?? false),
      { threshold: 0.1, ...options },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [options.threshold, options.root, options.rootMargin]);

  return { ref, isIntersecting };
}
