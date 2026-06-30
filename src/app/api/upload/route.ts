import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string || "image";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const originalExt = path.extname(file.name);
    const fileName = `${uniqueSuffix}${originalExt}`;

    let relativeUrl = "";

    // 1. Fetch settings for R2
    const settings = await db.setting.findMany({
      where: { group: "storage" }
    });
    
    const config: Record<string, string> = {};
    settings.forEach(s => {
      config[s.key] = s.value as string;
    });

    const isR2Enabled = config["r2_enabled"] === "true";

    // 2. Logic to save
    if (type === "image") {
      // Images always local public for fast serving
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      
      const savePath = path.join(uploadDir, fileName);
      await writeFile(savePath, buffer);
      relativeUrl = `/uploads/${fileName}`;
    } else {
      // Digital products
      if (isR2Enabled && config["r2_account_id"] && config["r2_access_key_id"] && config["r2_secret_access_key"] && config["r2_bucket_name"]) {
        // Upload to R2
        const S3 = new S3Client({
          region: "auto",
          endpoint: `https://${config["r2_account_id"]}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: config["r2_access_key_id"],
            secretAccessKey: config["r2_secret_access_key"],
          },
        });

        const r2Key = `products/${fileName}`;
        await S3.send(
          new PutObjectCommand({
            Bucket: config["r2_bucket_name"],
            Key: r2Key,
            Body: buffer,
            ContentType: file.type || "application/zip",
          })
        );
        relativeUrl = `r2://${config["r2_bucket_name"]}/${r2Key}`;
      } else {
        // Fallback Local
        const uploadDir = path.join(process.cwd(), "storage", "products");
        await mkdir(uploadDir, { recursive: true });
        
        const savePath = path.join(uploadDir, fileName);
        await writeFile(savePath, buffer);
        relativeUrl = fileName;
      }
    }

    return NextResponse.json({ 
      success: true, 
      url: relativeUrl,
      originalName: file.name,
      size: file.size
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Error uploading file" }, { status: 500 });
  }
}
