"use client";

import * as React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <html lang="es">
      <body>
        <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
          <h2 style={{ color: "red" }}>¡Error Crítico (Global)!</h2>
          <p>{error.message}</p>
          <pre style={{ background: "#eee", padding: "1rem", overflow: "auto" }}>
            {error.stack}
          </pre>
          <button onClick={() => reset()} style={{ padding: "0.5rem 1rem", marginTop: "1rem" }}>
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  );
}
