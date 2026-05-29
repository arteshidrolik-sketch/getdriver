
export default function TalepDetayPage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Talep Detayı</h1>
      <p>Bu sayfa uygulama içinde çalışır.</p>
    </div>
  );
}

export function generateStaticParams() {
  return [{ id: 'demo' }];
}
