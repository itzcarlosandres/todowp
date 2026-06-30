/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, FileIcon, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { toast } from "sonner";
import Image from "next/image";

interface FileUploaderProps {
  onUploadSuccess: (url: string, originalName?: string, size?: number) => void;
  type?: "image" | "file";
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  defaultUrl?: string;
}

export function FileUploader({
  onUploadSuccess,
  type = "image",
  accept,
  maxSizeMB = 50,
  className,
  defaultUrl
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(defaultUrl || null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleUpload(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`El archivo excede el límite de ${maxSizeMB}MB`);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (type === "image") {
        setPreview(data.url);
      } else {
        setFileName(file.name);
      }

      toast.success("Archivo subido correctamente");
      onUploadSuccess(data.url, data.originalName, data.size);
    } catch (err: any) {
      toast.error(err.message || "Error al subir el archivo");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={cn("relative", className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept || (type === "image" ? "image/*" : "*")}
        className="hidden"
      />

      {(preview || fileName) && !isUploading ? (
        <div className="relative overflow-hidden rounded-lg border border-border/60 bg-muted/30">
          {type === "image" && preview ? (
            <div className="relative aspect-[4/3] w-full">
              <Image src={preview} alt="Preview" fill className="object-cover" />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4">
              <div className="flex size-10 items-center justify-center rounded-md bg-brand-500/10 text-brand-600">
                <FileIcon className="size-5" />
              </div>
              <div className="flex-1 truncate">
                <p className="truncate text-sm font-medium">{fileName || defaultUrl}</p>
              </div>
            </div>
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            className="absolute right-2 top-2 z-10 size-7 rounded-full opacity-80 hover:opacity-100 shadow-sm"
            onClick={() => {
              setPreview(null);
              setFileName(null);
              onUploadSuccess(""); // clear it
            }}
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:bg-muted/50",
            isDragging ? "border-brand-500 bg-brand-500/5" : "border-border/60",
            isUploading && "pointer-events-none opacity-50"
          )}
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            {isUploading ? (
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            ) : type === "image" ? (
              <ImageIcon className="size-6 text-muted-foreground" />
            ) : (
              <Upload className="size-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">
              {isUploading ? "Subiendo archivo..." : `Haz clic o arrastra un ${type === "image" ? "imagen" : "archivo"}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Máximo {maxSizeMB}MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
