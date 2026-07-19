import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storageRead, isR2Enabled } from "@/lib/storage";

/**
 * Sirve archivos almacenados localmente (cuando R2 no está configurado).
 *
 * Esta ruta es necesaria porque los archivos de producto NO se guardan
 * en /public (para que no sean accesibles sin autenticación). El flujo es:
 *   1. Cliente pide download
 *   2. API valida compra/membresía
 *   3. API devuelve URL /api/storage?key=...
 *   4. Cliente hace GET a esa URL con su sesión
 *   5. Esta ruta verifica sesión y sirve el archivo
 *
 * Si R2 está habilitado, esta ruta solo redirige a la URL firmada de R2.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    const filename = searchParams.get("filename") ?? undefined;

    if (!key) {
      return new NextResponse("Missing key", { status: 400 });
    }

    // Si la key viene como r2://, no debería llegar aquí
    if (key.startsWith("r2://")) {
      return new NextResponse("R2 keys should be served directly", { status: 400 });
    }

    // Si R2 está activo, redirigir a URL firmada
    if (isR2Enabled()) {
      const { storageGetUrl } = await import("@/lib/storage");
      const url = await storageGetUrl(key, filename);
      return NextResponse.redirect(url);
    }

    // Verificar que el usuario tiene derecho a este archivo:
    //   - admins pueden todo
    //   - usuarios solo pueden descargar productos que compraron
    //   - usuarios con membresía activa pueden descargar productos
    //     de categorías autorizadas
    if (session.user.role !== "ADMIN") {
      // Buscamos todas las versiones cuyo fileKey coincida
      const versions = await db.productVersion.findMany({
        where: { fileKey: key },
        include: { product: true },
      });

      if (versions.length === 0) {
        return new NextResponse("File not associated with any product", { status: 404 });
      }

      const allowed = await hasAccess(session.user.id, versions, session.user.role);
      if (!allowed) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }

    const buffer = await storageRead(key);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Disposition": filename
          ? `attachment; filename="${filename.replace(/"/g, "")}"`
          : "attachment",
        "Content-Type": "application/octet-stream",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err: any) {
    console.error("Storage serve error:", err);
    if (err?.code === "ENOENT") {
      return new NextResponse("File not found on server", { status: 404 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

async function hasAccess(
  userId: string,
  versions: { productId: string; product: { categoryId: string } }[],
  _role: string,
): Promise<boolean> {
  // Chequear membresía activa con categoría autorizada
  const membership = await db.userMembership.findUnique({
    where: { userId },
    include: { plan: true },
  });

  if (
    membership?.status === "ACTIVE" &&
    membership.plan &&
    (!membership.expiresAt || membership.expiresAt > new Date())
  ) {
    const authorized = membership.plan.authorizedCategories ?? [];
    for (const v of versions) {
      if (authorized.includes(v.product.categoryId)) return true;
    }
  }

  // Chequear compras
  const productIds = [...new Set(versions.map((v) => v.productId))];
  const orderCount = await db.order.count({
    where: {
      userId,
      status: "PAID",
      items: { some: { productId: { in: productIds } } },
    },
  });
  return orderCount > 0;
}
