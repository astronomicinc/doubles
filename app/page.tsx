import { readFileSync } from 'node:fs';
import path from 'node:path';
import { getVolumeSeats } from '@/app/lib/supabase';

/**
 * Homepage — Phase 2 Migration
 *
 * Dynamic tokens used in public/index.html:
 *   {{seats_remaining}}  — number from getVolumeSeats(volumeId).remaining
 *   {{seats_total}}      — number from getVolumeSeats(volumeId).total
 */

export default async function HomePage() {
  // 1. Read the static HTML file from public/
  const html = readFileSync(
    path.join(process.cwd(), 'public', 'index.html'),
    'utf8'
  );

  // 2. Fetch dynamic data from Supabase
  // For now, hardcode 'vol-01' as the current volume
  // In Phase 3, this can be configurable or from a database setting
  const seats = await getVolumeSeats('vol-01');

  // 3. Interpolate tokens
  const interpolated = html
    .replace('{{seats_remaining}}', String(seats.remaining))
    .replace('{{seats_total}}', String(seats.total));

  // 4. Extract styles and body content
  const styles = extractStyles(interpolated);
  const body = extractBody(interpolated);

  // 5. Render: styles + body
  const content = styles + body;

  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}

/**
 * Extract <style> tags from HTML head
 */
function extractStyles(html: string): string {
  const match = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  return match ? `<style>${match[1]}</style>` : '';
}

/**
 * Extract body content from HTML, removing <html>, <head>, <body> wrapper tags
 * We rely on app/layout.tsx to provide the html/head structure
 */
function extractBody(html: string): string {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1] : html;
}
