import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { readFile } from "fs/promises";
import path from "path";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { versionId } = await params;

    // Verify user actually purchased this product version (or product)
    const version = await db.productVersion.findUnique({
      where: { id: versionId },
      include: { product: true }
    });

    if (!version) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Admins can download anything
    const isAdmin = session.user.role === "ADMIN";

    if (!isAdmin) {
      // Check if user has an ACTIVE membership
      const membership = await db.userMembership.findUnique({
        where: { userId: session.user.id },
        include: { plan: true },
      });

      let hasMembershipAccess = false;

      if (membership && membership.status === "ACTIVE" && membership.plan) {
        const isExpired = membership.expiresAt && membership.expiresAt < new Date();
        
        if (!isExpired) {
          // Check if product's category is in the plan's authorized categories
          const authorizedCats = membership.plan.authorizedCategories || [];

          if (authorizedCats.includes(version.product.categoryId)) {
            hasMembershipAccess = true;
          }
        }
      }

      if (!hasMembershipAccess) {
        // Fallback to checking if they purchased the product
        const orderCount = await db.order.count({
          where: {
            userId: session.user.id,
            status: "PAID",
            items: {
              some: {
                productId: version.productId
              }
            }
          }
        });

        if (orderCount === 0) {
          return new NextResponse("Forbidden: You haven't purchased this product or lack a valid membership", { status: 403 });
        }
      }
    }

    // Now serve the file
    const fileKey = version.fileKey;

    if (fileKey.startsWith("r2://")) {
      // Serve via R2 Presigned URL
      const settings = await db.setting.findMany({
        where: { group: "storage" }
      });
      const config: Record<string, string> = {};
      settings.forEach(s => {
        config[s.key] = s.value as string;
      });

      if (!config["r2_account_id"] || !config["r2_bucket_name"]) {
        return new NextResponse("R2 storage not configured properly", { status: 500 });
      }

      const S3 = new S3Client({
        region: "auto",
        endpoint: `https://${config["r2_account_id"]}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: config["r2_access_key_id"] || "",
          secretAccessKey: config["r2_secret_access_key"] || "",
        },
      });

      const actualKey = fileKey.replace(`r2://${config["r2_bucket_name"]}/`, "");
      
      const command = new GetObjectCommand({
        Bucket: config["r2_bucket_name"],
        Key: actualKey,
        ResponseContentDisposition: `attachment; filename="${version.fileName}"`,
      });

      const signedUrl = await getSignedUrl(S3, command, { expiresIn: 3600 });
      return NextResponse.redirect(signedUrl);

    } else {
      // Local File
      const filePath = path.join(process.cwd(), "storage", "products", fileKey);
      try {
        const fileBuffer = await readFile(filePath);
        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Disposition": `attachment; filename="${version.fileName}"`,
            "Content-Type": "application/octet-stream",
          },
        });
      } catch (err) {
        console.error(err);
        return new NextResponse("File not found on server", { status: 404 });
      }
    }

  } catch (error) {
    console.error("Download Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
