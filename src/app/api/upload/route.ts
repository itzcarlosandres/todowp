import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { storagePut, isR2Enabled } from "@/lib/storage";
import path from "path";

export const runtime = "nodejs";

/**
 * Sube un archivo al backend de storage configurado.
 *
 * Body (multipart/form-data):
 *   - file: el archivo a subir
 *   - type: "image" | "product" (default: "image")
 *
 * Comportamiento:
 *   - Imágenes: se guardan SIEMPRE en local (public/uploads) para servirse
 *     rápido desde el CDN/edge sin pasar por auth. Esto es seguro porque
 *     las imágenes son contenido público del marketplace.
 *   - Productos digitales: se guardan en R2 si está habilitado, sino en
 *     local (storage/products). Los productos requieren autenticación para
 *     descargarse, por eso pasan por /api/storage.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "image";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const originalExt = path.extname(file.name);
    const fileName = `${uniqueSuffix}${originalExt}`;

    if (type === "image") {
      // Imágenes: SIEMPRE van a /public/uploads para servirse vía CDN
      // sin autenticación (son contenido público).
      const { writeFile, mkdir } = await import("fs/promises");
      const { join } = await import("path");
      const uploadDir = join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const savePath = join(uploadDir, fileName);
      await writeFile(savePath, buffer);
      return NextResponse.json({
        success: true,
        url: `/uploads/${fileName}`,
        backend: "local-public",
        originalName: file.name,
        size: file.size,
      });
    }

    // Productos digitales: usan el storage abstracto
    const r2Key = `products/${fileName}`;
    const storedKey = await storagePut(
      r2Key,
      buffer,
      file.type || "application/zip",
    );

    return NextResponse.json({
      success: true,
      url: storedKey,
      backend: isR2Enabled() ? "r2" : "local",
      originalName: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Error uploading file" }, { status: 500 });
  }
}
