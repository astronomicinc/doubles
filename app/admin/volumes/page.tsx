import { readFileSync } from 'node:fs';
import path from 'node:path';

export default async function AdminVolumesPage() {
  // 1. Read the static HTML file
  const html = readFileSync(
    path.join(process.cwd(), 'public', 'admin-volumes.html'),
    'utf8'
  );

  // For Phase 2A, this page renders with the static HTML
  // In Phase 3, we'll fetch volumes and add dynamic data replacement + admin auth
  // const volumes = await listAllVolumes();

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
