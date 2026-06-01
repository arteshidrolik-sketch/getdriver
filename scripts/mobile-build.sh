#!/bin/bash
set -e

cd "$(dirname "$0")/.."
echo "📱 Mobile Build - Starting..."

# 1. Backup entire app directory
echo "📦 Full backup of app/..."
cp -r app .app-backup

# 2. Remove API routes entirely
echo "🗑️  Removing API routes..."
rm -rf app/api

# 3. Remove dynamic route directories entirely ([id], [slug], etc.)
echo "🗑️  Removing dynamic routes..."
find app -type d -name '*\[*' | while IFS= read -r d; do
  echo "  Removing: $d"
  rm -rf "$d"
done

# 4. Stub all remaining server-side pages and layouts
echo "🔍 Converting server-side pages..."
find app -name "page.tsx" | while IFS= read -r f; do
  head -3 "$f" | grep -q "use client" && continue
  echo "  Stub page: $f"
  echo 'export default function Page() { return null; }' > "$f"
done

find app -name "layout.tsx" | while IFS= read -r f; do
  head -3 "$f" | grep -q "use client" && continue
  echo "  Stub layout: $f"
  printf 'import React from "react";\nexport default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }\n' > "$f"
done

# 5. Clean all caches
echo "🧹 Cleaning caches..."
rm -rf .next dist tsconfig.tsbuildinfo

# 6. Build
echo "🔨 Building with CAPACITOR_BUILD=true..."
CAPACITOR_BUILD=true npx next build || BUILD_FAILED=1

# 7. Restore original app directory
echo "📦 Restoring original app/..."
rm -rf app
mv .app-backup app

echo "🔄 Files restored."

if [ "$BUILD_FAILED" = "1" ]; then
  echo "❌ Build failed!"
  exit 1
fi

echo "✅ Build successful!"
