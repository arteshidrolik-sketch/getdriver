import { NextResponse } from 'next/server';

export async function GET() {
  const assetlinks = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name:
          'app.vercel.getdriver_apc6hvu0x_arteshidrolik_sketchs_projects.twa',
        sha256_cert_fingerprints: [
          '6B:81:5F:97:63:C1:54:96:CA:9E:CB:D1:CB:20:D3:21:79:5A:2D:D4:00:6A:0C:CF:B7:DC:B6:B8:9C:2B:5A:26',
        ],
      },
    },
  ];

  return NextResponse.json(assetlinks, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
