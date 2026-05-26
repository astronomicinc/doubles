import { readFileSync } from 'node:fs';
import path from 'node:path';

export default async function PostEventNoMutualsPage() {
  // 1. Read the static HTML file
  const html = readFileSync(
    path.join(process.cwd(), 'public', 'post-event-no-mutuals.html'),
    'utf8'
  );

  // This page is mostly static; minimal token replacement needed
  // For Phase 3, we can fetch next volume and add personalized picks data
  // const nextVolume = await getNextVolume();

  // 3. Extract styles and body
  const styles = extractStyles(html);
  const body = extractBody(html);

  // 4. Render
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
 * Extract body content from HTML
 */
function extractBody(html: string): string {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1] : html;
}
