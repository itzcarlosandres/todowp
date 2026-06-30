"use client";

import * as React from "react";
import { MotionConfig } from "framer-motion";

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      reducedMotion="user"
    >
      {children}
    </MotionConfig>
  );
}
