import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatPhone(phone: string): string {
  const cleaned = phone?.replace(/\D/g, "") ?? "";
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
  }
  return phone ?? "";
}

export function maskPhone(phone: string): string {
  const cleaned = phone?.replace(/\D/g, "") ?? "";
  if (cleaned.length >= 10) {
    return `${cleaned.slice(0, 3)}****${cleaned.slice(-3)}`;
  }
  return "***";
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Güçlü şifre validasyonu - en az 8 karakter, 1 büyük harf, 1 küçük harf, 1 rakam
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: "Şifre en az 8 karakter olmalı" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Şifre en az bir büyük harf içermeli" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Şifre en az bir küçük harf içermeli" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Şifre en az bir rakam içermeli" };
  }
  return { valid: true };
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    ACTIVE: "Aktif",
    ACCEPTED: "Kabul Edildi",
    CANCELLED: "İptal",
    EXPIRED: "Süresi Doldu",
    PENDING: "Bekliyor",
    APPROVED: "Onaylandı",
    REJECTED: "Reddedildi",
    PENDING_PICKUP: "Sürücü Yolda",
    DRIVER_ARRIVED: "Sürücü Geldi",
    PHOTOS_BEFORE: "Fotoğraf Çekimi",
    IN_PROGRESS: "Yolculuk Devam Ediyor",
    PHOTOS_AFTER: "Teslim Fotoğrafları",
    COMPLETED: "Tamamlandı",
    DISPUTED: "Uyuşmazlık",
    PRE_AUTH: "Ön Yetkilendirme",
    REFUNDED: "İade Edildi",
    FAILED: "Başarısız",
    OPEN: "Açık",
    UNDER_REVIEW: "İnceleniyor",
    RESOLVED_CUSTOMER: "Müşteri Lehine",
    RESOLVED_DRIVER: "Sürücü Lehine",
    CLOSED: "Kapatıldı",
    IN_PROGRESS_TICKET: "İşleniyor",
    RESOLVED: "Çözüldü",
    SUSPENDED: "Askıda",
    BANNED: "Engelli",
  };
  return statusMap[status] || status;
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    ACCEPTED: "bg-blue-100 text-blue-800",
    CANCELLED: "bg-red-100 text-red-800",
    EXPIRED: "bg-gray-100 text-gray-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    PENDING_PICKUP: "bg-blue-100 text-blue-800",
    DRIVER_ARRIVED: "bg-indigo-100 text-indigo-800",
    PHOTOS_BEFORE: "bg-purple-100 text-purple-800",
    IN_PROGRESS: "bg-cyan-100 text-cyan-800",
    PHOTOS_AFTER: "bg-purple-100 text-purple-800",
    COMPLETED: "bg-green-100 text-green-800",
    DISPUTED: "bg-orange-100 text-orange-800",
    OPEN: "bg-blue-100 text-blue-800",
    UNDER_REVIEW: "bg-yellow-100 text-yellow-800",
    CLOSED: "bg-gray-100 text-gray-800",
    SUSPENDED: "bg-orange-100 text-orange-800",
    BANNED: "bg-red-100 text-red-800",
  };
  return colorMap[status] || "bg-gray-100 text-gray-800";
}