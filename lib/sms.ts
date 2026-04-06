interface IletimerkeziConfig {
  apiKey: string;
  apiHash: string;
  senderId: string;
}

function getIletimerkeziConfig(): IletimerkeziConfig | null {
  const apiKey = process.env.ILETIMERKEZI_API_KEY;
  const apiHash = process.env.ILETIMERKEZI_API_HASH;
  const senderId = process.env.ILETIMERKEZI_SENDER_ID;

  if (!apiKey || !apiHash || !senderId) {
    console.error("İletimerkezi environment variables not configured");
    return null;
  }

  return { apiKey, apiHash, senderId };
}

export async function sendSMS(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  const config = getIletimerkeziConfig();
  
  if (!config || !config.apiKey || !config.apiHash) {
    console.error("İletimerkezi yapılandırması eksik");
    return { success: false, error: "SMS servisi yapılandırılmamış" };
  }

  // Telefon numarasını düzenle - 5xxxxxxxxx formatında olmalı
  let formattedPhone = phone.replace(/\s/g, "").replace(/^\+/, "").replace(/^90/, "").replace(/^0/, "");
  
  // Eğer 10 haneli değilse ve 5 ile başlamıyorsa hata
  if (formattedPhone.length !== 10 || !formattedPhone.startsWith("5")) {
    console.error("Geçersiz telefon numarası formatı:", formattedPhone);
    return { success: false, error: "Geçersiz telefon numarası formatı" };
  }

  try {
    // İletimerkezi GET API
    const params = new URLSearchParams({
      key: config.apiKey,
      hash: config.apiHash,
      text: message,
      receipents: formattedPhone,
      sender: config.senderId,
      iys: "1",
      iysList: "BIREYSEL"
    });

    const url = `https://api.iletimerkezi.com/v1/send-sms/get/?${params.toString()}`;
    console.log("İletimerkezi request URL (without credentials):", url.replace(config.apiKey, "***").replace(config.apiHash, "***"));

    const response = await fetch(url, {
      method: "GET",
    });

    const responseText = await response.text();
    console.log("İletimerkezi response:", responseText);

    // Başarı kontrolü - XML response'da status code kontrol et
    if (responseText.includes("<code>200</code>") || responseText.includes("<code>110</code>")) {
      return { success: true };
    }

    // Hata durumu
    const errorMatch = responseText.match(/<message>([^<]+)<\/message>/);
    const errorMessage = errorMatch ? errorMatch[1] : "SMS gönderilemedi";
    
    return { success: false, error: errorMessage };
  } catch (error) {
    console.error("SMS gönderim hatası:", error);
    return { success: false, error: "SMS gönderilirken bir hata oluştu" };
  }
}

export async function sendOTPSMS(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
  const message = `GüvenliSür doğrulama kodunuz: ${code}\n\nBu kodu kimseyle paylaşmayın. Kod 5 dakika geçerlidir.`;
  return sendSMS(phone, message);
}
