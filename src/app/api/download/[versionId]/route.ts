import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storageGetUrl, storageRead, isR2Enabled } from "@/lib/storage";

export const runtime = "nodejs";

/**
 * Descarga un producto digital.
 *
 * 1. Verifica que el usuario compró el producto (o tiene membresía activa con
 *    la categoría autorizada, o es admin).
 * 2. Si R2 está activo, redirige a URL firmada de R2.
 * 3. Si R2 no está activo, devuelve el archivo desde local.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ versionId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { versionId } = await params;

    const version = await db.productVersion.findUnique({
      where: { id: versionId },
      include: { product: true },
    });
    if (!version) return new NextResponse("Not Found", { status: 404 });

    const isAdmin = session.user.role === "ADMIN";

    if (!isAdmin) {
      // Membresía
      const membership = await db.userMembership.findUnique({
        where: { userId: session.user.id },
        include: { plan: true },
      });

      let hasAccess = false;
      if (
        membership?.status === "ACTIVE" &&
        membership.plan &&
        (!membership.expiresAt || membership.expiresAt > new Date())
      ) {
        const authorized = membership.plan.authorizedCategories ?? [];
        if (authorized.includes(version.product.categoryId)) {
          hasAccess = true;
        }
      }

      // Compra directa
      if (!hasAccess) {
        const orderCount = await db.order.count({
          where: {
            userId: session.user.id,
            status: "PAID",
            items: { some: { productId: version.productId } },
          },
        });
        hasAccess = orderCount > 0;
      }

      if (!hasAccess) {
        return new NextResponse("Forbidden: no purchase or membership for this product", {
          status: 403,
        });
      }
    }

    const fileKey = version.fileKey;
    const filename = version.fileName;

    if (isR2Enabled() && fileKey.startsWith("r2://")) {
      const url = await storageGetUrl(fileKey, filename);
      return NextResponse.redirect(url);
    }

    // Local: leer y devolver directamente
    const buffer = await storageRead(fileKey);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Disposition": `attachment; filename="${filename.replace(/"/g, "")}"`,
        "Content-Type": "application/octet-stream",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err: any) {
    console.error("Download Error:", err);
    if (err?.code === "ENOENT") {
      return new NextResponse("File not found on server", { status: 404 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
