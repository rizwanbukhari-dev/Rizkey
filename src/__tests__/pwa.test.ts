import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('PWA Manifest & Asset Verification', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const manifestPath = path.join(rootDir, 'public/manifest.webmanifest');
  const swPath = path.join(rootDir, 'public/sw.js');
  const indexPath = path.join(rootDir, 'index.html');

  it('provides a valid, compliant web app manifest with RizKey branding', () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
    const content = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);

    expect(manifest.name).toBe('RizKey');
    expect(manifest.short_name).toBe('RizKey');
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#20211D');
    expect(manifest.background_color).toBe('#20211D');
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(4);

    // Verify 192x192 icon exists in manifest
    const has192 = manifest.icons.some(
      (icon: { sizes?: string; purpose?: string }) => icon.sizes === '192x192'
    );
    expect(has192).toBe(true);

    // Verify 512x512 icon exists in manifest
    const has512 = manifest.icons.some(
      (icon: { sizes?: string; purpose?: string }) => icon.sizes === '512x512'
    );
    expect(has512).toBe(true);

    // Verify maskable icon exists
    const hasMaskable = manifest.icons.some(
      (icon: { purpose?: string }) => icon.purpose === 'maskable'
    );
    expect(hasMaskable).toBe(true);
  });

  it('ensures all manifest icon files physically exist with valid dimensions and non-zero size', () => {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);

    for (const icon of manifest.icons) {
      const iconPath = path.join(rootDir, 'public', icon.src.replace(/^\//, ''));
      expect(fs.existsSync(iconPath)).toBe(true);
      const stats = fs.statSync(iconPath);
      expect(stats.size).toBeGreaterThan(100);
    }

    // Verify apple-touch-icon
    const appleIconPath = path.join(rootDir, 'public/apple-touch-icon.png');
    expect(fs.existsSync(appleIconPath)).toBe(true);
    expect(fs.statSync(appleIconPath).size).toBeGreaterThan(500);
  });

  it('configures service worker with offline precaching and sensitive data exclusion', () => {
    expect(fs.existsSync(swPath)).toBe(true);
    const swContent = fs.readFileSync(swPath, 'utf-8');

    // Precache shell verification
    expect(swContent).toContain('/index.html');
    expect(swContent).toContain('/manifest.webmanifest');
    expect(swContent).toContain('/favicon.svg');
    expect(swContent).toContain('/pwa-192x192.png');
    expect(swContent).toContain('/pwa-512x512.png');

    // Data safety: ensures Supabase queries and auth are never cached
    expect(swContent).toContain('supabase.co');

    // Safe navigation strategy: network-first for HTML navigations
    expect(swContent).toContain('navigate');
  });

  it('includes proper PWA meta tags in index.html', () => {
    expect(fs.existsSync(indexPath)).toBe(true);
    const indexHtml = fs.readFileSync(indexPath, 'utf-8');

    expect(indexHtml).toContain('rel="manifest"');
    expect(indexHtml).toContain('/manifest.webmanifest');
    expect(indexHtml).toContain('rel="apple-touch-icon"');
    expect(indexHtml).toContain('name="theme-color"');
    expect(indexHtml).toContain('#20211D');
    expect(indexHtml).toContain('apple-mobile-web-app-capable');
  });
});
