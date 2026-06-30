"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  title: string;
  video?: string | null;
}

export function ProductGallery({ images, title, video }: ProductGalleryProps) {
  const [active, setActive] = React.useState(0);
  const [lightbox, setLightbox] = React.useState(false);
  const allMedia = video ? [video, ...images] : images;

  const next = () => setActive((p) => (p + 1) % allMedia.length);
  const prev = () => setActive((p) => (p - 1 + allMedia.length) % allMedia.length);

  return (
    <div className="space-y-3">
      <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/60 bg-muted">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            {allMedia[active]?.includes("video") || (video && active === 0) ? (
              <div className="flex size-full items-center justify-center bg-black">
                <Play className="size-16 text-white/80" />
              </div>
            ) : (
              <Image
                src={allMedia[active] ?? ""}
                alt={title}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
                priority
              />
            )}
          </motion.div>
        </AnimatePresence>

        {allMedia.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-md opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Anterior"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-md opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Siguiente"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}

        <button
          onClick={() => setLightbox(true)}
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-md opacity-0 transition-opacity group-hover:opacity-100"
          aria-label="Pantalla completa"
        >
          <Maximize2 className="size-4" />
        </button>

        {allMedia.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {allMedia.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={cn(
                  "size-1.5 rounded-full transition-all",
                  i === active ? "w-6 bg-white" : "bg-white/50",
                )}
                aria-label={`Imagen ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {allMedia.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {allMedia.slice(0, 5).map((media, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg border-2 transition-colors",
                i === active ? "border-primary" : "border-border/60 hover:border-border",
              )}
            >
              <Image
                src={typeof media === "string" ? media : ""}
                alt={`${title} ${i + 1}`}
                fill
                sizes="100px"
                className="object-cover"
              />
              {i === 0 && video && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Play className="size-4 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
          >
            <button
              onClick={() => setLightbox(false)}
              className="absolute right-4 top-4 text-white/80 hover:text-white"
            >
              Cerrar
            </button>
            <Image
              src={allMedia[active] ?? ""}
              alt={title}
              width={1600}
              height={1200}
              className="max-h-[90vh] w-auto rounded-lg object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
