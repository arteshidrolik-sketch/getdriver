export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { put, del } from "@vercel/blob";

// İzin verilen içerik tipleri
const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const pathPrefix = (formData.get("path") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    // Boyut kontrolü
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Dosya çok büyük (max 10MB)" },
        { status: 400 }
      );
    }

    // Tür kontrolü
    if (!ALLOWED_CONTENT_TYPES.has(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: `Desteklenmeyen dosya türü: ${file.type}` },
        { status: 400 }
      );
    }

    const fileName = file.name.replace(/[^a-zA-Z0-9._\-]/g, "_").substring(0, 200);
    const blobPath = `${pathPrefix}/${Date.now()}-${fileName}`;

    const blob = await put(blobPath, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      cloud_storage_path: blob.url,
      pathname: blob.pathname,
    });
  } catch (error) {
    console.error("Blob upload error:", error);
    return NextResponse.json(
      { error: "Dosya yüklenemedi" },
      { status: 500 }
    );
  }
}

// DELETE - Dosya silme
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL gerekli" }, { status: 400 });
    }

    await del(url);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Blob delete error:", error);
    return NextResponse.json(
      { error: "Dosya silinemedi" },
      { status: 500 }
    );
  }
}
