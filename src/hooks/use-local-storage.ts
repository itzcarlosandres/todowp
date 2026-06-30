"use client";

import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const item = window.localStorage.getItem(key);
      if (item) setValue(JSON.parse(item) as T);
    } catch {
      // ignore
    }
  }, [key]);

  const setStoredValue = (newValue: T) => {
    setValue(newValue);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(newValue));
    }
  };

  return [value, setStoredValue] as const;
}
