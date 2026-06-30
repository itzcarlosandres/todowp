"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h2 className="mb-4 text-2xl font-bold">¡Algo salió mal!</h2>
      <p className="mb-6 text-muted-foreground max-w-md">
        {error.message || "Ha ocurrido un error inesperado en la aplicación."}
      </p>
      <div className="bg-red-500/10 text-red-500 p-4 rounded-md mb-6 max-w-xl text-left overflow-auto text-sm">
        <pre>{error.stack}</pre>
      </div>
      <Button variant="brand" onClick={() => reset()}>
        Intentar de nuevo
      </Button>
    </div>
  );
}
