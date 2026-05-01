'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">📡</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          İnternet Bağlantısı Yok
        </h1>
        <p className="text-gray-600 mb-6">
          Şu an internet bağlantınız yok gibi görünüyor. 
          Lütfen bağlantınızı kontrol edip tekrar deneyin.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  );
}
