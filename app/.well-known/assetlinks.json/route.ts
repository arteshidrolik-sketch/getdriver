import { NextResponse } from 'next/server';

export async function GET() {
  const assetlinks = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name:
          'com.getdriver.app',
        sha256_cert_fingerprints: [
          'AE:80:61:B6:4F:E5:2D:B4:6E:8A:BD:BF:03:BE:C2:CA:4C:AC:62:50:B1:64:19:5B:7A:F5:87:90:26:44:A9:B6',
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
