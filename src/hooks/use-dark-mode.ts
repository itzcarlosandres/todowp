"use client";

import * as React from "react";
import { useLocalStorage } from "./use-local-storage";

export function useDarkMode() {
  const [theme, setTheme] = useLocalStorage<"light" | "dark" | "system">("theme", "system");
  const isDark = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return theme === "dark";
  }, [theme]);

  return { theme, setTheme, isDark };
}
