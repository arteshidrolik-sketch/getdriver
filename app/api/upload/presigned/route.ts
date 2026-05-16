export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { put } from "@vercel/blob";

// İzin verilen içerik tipleri (whitelist)
const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
]);

// Maksimum dosya boyutu: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Güvenli dosya adı
function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._\-]/g, "_")
    .replace(/\.{2,}/g, ".")
    .substring(0, 200);
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";
    
    // Check if this is a direct file upload or JSON request for presigned URL
    if (contentType.includes("application/json")) {
      // Legacy presigned URL request - return a direct upload endpoint
      const { fileName, contentType: fileType } = await request.json();

      if (!fileName || !fileType) {
        return NextResponse.json(
          { error: "Dosya adı ve türü gerekli" },
          { status: 400 }
        );
      }

      if (!ALLOWED_CONTENT_TYPES.has(fileType.toLowerCase())) {
        return NextResponse.json(
          { error: `Desteklenmeyen dosya türü: ${fileType}` },
          { status: 400 }
        );
      }

      // Return upload endpoint info for client-side direct upload
      return NextResponse.json({
        uploadUrl: "/api/upload/blob",
        method: "POST",
        cloud_storage_path: `uploads/${Date.now()}-${sanitizeFileName(fileName)}`,
      });
    }

    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Yükleme hatası" },
      { status: 500 }
    );
  }
}
