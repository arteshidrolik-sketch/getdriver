// Rate limiting için basit in-memory store
// Production'da Redis kullanılması önerilir

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Her 5 dakikada bir eski entry'leri temizle
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  // Maksimum istek sayısı
  maxRequests: number;
  // Süre penceresi (milisaniye)
  windowMs: number;
}

// Varsayılan yapılandırmalar
export const RATE_LIMIT_CONFIGS = {
  // Login: 5 dakikada 10 deneme
  login: { maxRequests: 10, windowMs: 5 * 60 * 1000 },
  // Signup: 1 saatte 5 kayıt
  signup: { maxRequests: 5, windowMs: 60 * 60 * 1000 },
  // OTP gönderme: 5 dakikada 3 deneme
  otpSend: { maxRequests: 3, windowMs: 5 * 60 * 1000 },
  // OTP doğrulama: 1 dakikada 5 deneme (brute force koruması)
  otpVerify: { maxRequests: 5, windowMs: 60 * 1000 },
  // Genel API: 1 dakikada 100 istek
  api: { maxRequests: 100, windowMs: 60 * 1000 },
  // Şifre değiştirme: 1 saatte 5 deneme
  passwordChange: { maxRequests: 5, windowMs: 60 * 60 * 1000 },
};

/**
 * Rate limit kontrolü
 * @param identifier - IP adresi veya kullanıcı ID
 * @param action - Yapılan işlem (login, signup, vb.)
 * @param config - Rate limit yapılandırması
 * @returns { success: boolean, remaining: number, resetIn: number }
 */
export function checkRateLimit(
  identifier: string,
  action: string,
  config: RateLimitConfig
): { success: boolean; remaining: number; resetIn: number } {
  const key = `${action}:${identifier}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Henüz kayıt yoksa veya süre dolmuşsa
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }

  // Limit aşılmış mı?
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  // Sayıcıyı artır
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}

/**
 * IP adresini request'ten al
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

/**
 * Rate limit aşıldığında dönülecek hata yanıtı
 */
export function rateLimitExceededResponse(resetIn: number) {
  const resetInMinutes = Math.ceil(resetIn / 60000);
  return {
    error: `Çok fazla istek. Lütfen ${resetInMinutes} dakika sonra tekrar deneyin.`,
    retryAfter: Math.ceil(resetIn / 1000),
  };
}
