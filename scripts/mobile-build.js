#!/usr/bin/env node
/**
 * Mobile Build Script
 * 
 * API route'ları geçici olarak taşır, static export build yapar,
 * sonra geri getirir. Bu sayede output:'export' ile çakışma olmaz.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '..', 'app', 'api');
const API_BACKUP = path.join(__dirname, '..', '.api-backup');

// Server-side layout/page'leri de sorun çıkarabilir
const SERVER_PAGES = [];

function findServerPages(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'api' && entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== 'dist') {
      findServerPages(fullPath);
    } else if (entry.isFile() && (entry.name === 'page.tsx' || entry.name === 'layout.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (!content.includes("'use client'") && !content.includes('"use client"')) {
        SERVER_PAGES.push(fullPath);
      }
    }
  }
}

console.log('📱 Mobile Build - Starting...');

// 1. Backup API directory
if (fs.existsSync(API_DIR)) {
  console.log('📦 Backing up API routes...');
  execSync(`cp -r "${API_DIR}" "${API_BACKUP}"`);
  execSync(`rm -rf "${API_DIR}"`);
  // Create empty api dir with a dummy route to avoid import errors
  fs.mkdirSync(API_DIR, { recursive: true });
}

// 2. Find and convert server pages to client stubs
console.log('🔍 Finding server-side pages...');
const appDir = path.join(__dirname, '..', 'app');
findServerPages(appDir);

// Also find ALL dynamic route pages (even client ones need generateStaticParams for export)
function findDynamicPages(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== 'dist' && entry.name !== 'api') {
      findDynamicPages(fullPath);
    } else if (entry.isFile() && entry.name === 'page.tsx' && fullPath.includes('[')) {
      if (!SERVER_PAGES.includes(fullPath)) {
        SERVER_PAGES.push(fullPath);
      }
    }
  }
}
findDynamicPages(appDir);

const serverPageBackups = [];
for (const pagePath of SERVER_PAGES) {
  const backup = pagePath + '.server-backup';
  fs.copyFileSync(pagePath, backup);
  serverPageBackups.push({ original: pagePath, backup });
  
  const relativePath = path.relative(appDir, pagePath);
  const isLayout = pagePath.endsWith('layout.tsx');
  const isDynamic = pagePath.includes('[');
  console.log(`  Converting: ${relativePath}`);
  if (isLayout) {
    fs.writeFileSync(pagePath, `import React from "react";\nexport default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }\n`);
  } else if (isDynamic) {
    fs.writeFileSync(pagePath, `export function generateStaticParams() { return []; }\nexport default function Page() { return null; }\n`);
  } else {
    fs.writeFileSync(pagePath, `export default function Page() { return null; }\n`);
  }
}

// 3. Clean cache and run build
console.log('🧹 Cleaning .next cache...');
execSync('rm -rf .next', { cwd: path.join(__dirname, '..') });

console.log('🔨 Building with CAPACITOR_BUILD=true...');
try {
  execSync('CAPACITOR_BUILD=true npx next build', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ Build successful!');
} catch (error) {
  console.error('❌ Build failed!');
  // Still restore files
} finally {
  // 4. Restore API directory
  if (fs.existsSync(API_BACKUP)) {
    console.log('📦 Restoring API routes...');
    execSync(`rm -rf "${API_DIR}"`);
    execSync(`mv "${API_BACKUP}" "${API_DIR}"`);
  }

  // 5. Restore server pages
  for (const { original, backup } of serverPageBackups) {
    if (fs.existsSync(backup)) {
      fs.copyFileSync(backup, original);
      fs.unlinkSync(backup);
    }
  }
  console.log('🔄 Files restored.');
}
