export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { generatePresignedUploadUrl } from "@/lib/s3";

// İzin verilen içerik tipleri (whitelist)
const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
]);

// Maksimum dosya adı uzunluğu
const MAX_FILENAME_LENGTH = 200;

// Güvenli dosya adı: path traversal ve özel karakterleri temizle
function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._\-\u00C0-\u024F]/g, "_") // sadece güvenli karakterler
    .replace(/\.{2,}/g, ".") // çift nokta yok (path traversal)
    .substring(0, MAX_FILENAME_LENGTH);
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const { fileName, contentType } = await request.json();

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "Dosya adı ve türü gerekli" },
        { status: 400 }
      );
    }

    // İçerik tipi doğrulaması (whitelist)
    if (!ALLOWED_CONTENT_TYPES.has(contentType.toLowerCase())) {
      return NextResponse.json(
        {
          error: `Desteklenmeyen dosya türü: ${contentType}. İzin verilen türler: ${[...ALLOWED_CONTENT_TYPES].join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Dosya adını sanitize et
    const safeFileName = sanitizeFileName(String(fileName));
    if (!safeFileName) {
      return NextResponse.json({ error: "Geçersiz dosya adı" }, { status: 400 });
    }

    // isPublic parametresi kullanıcıdan alınmaz; sunucu tarafında false olarak sabitlendi.
    // Gerekirse bu mantık role/bağlama göre genişletilebilir.
    const isPublic = false;

    const { uploadUrl, cloud_storage_path } = await generatePresignedUploadUrl(
      safeFileName,
      contentType,
      isPublic
    );

    return NextResponse.json({
      uploadUrl,
      cloud_storage_path,
    });
  } catch (error) {
    console.error("Presigned URL error:", error);
    return NextResponse.json(
      { error: "Yükleme URL'i oluşturulamadı" },
      { status: 500 }
    );
  }
}
