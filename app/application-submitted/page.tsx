import { readFileSync } from 'node:fs';
import path from 'node:path';
import { getVolumeDetails } from '@/app/lib/supabase';

export default async function ApplicationSubmittedPage() {
  // 1. Read the static HTML file
  const html = readFileSync(
    path.join(process.cwd(), 'public', 'application-submitted.html'),
    'utf8'
  );

  // For Phase 2A (no auth wired yet), use mock data
  // In Phase 3, these will be fetched from authenticated user's actual data
  const mockData = {
    user_name: 'Jordan',
    friend_name: 'Alex',
    friend_initials: 'AM',
    submitted_time: 'May 24, 2026 · 2:47 PM',
    user_email: 'jordan@river.co',
    friend_email: 'alex@mendoza.studio',
    volume_id: 'vol-01',
    event_date: 'Sat, June 21',
  };

  // Fetch volume details
  const volume = await getVolumeDetails(mockData.volume_id);

  const volume_name = `Vol. 01 — ${volume?.name || 'Founding Launch'}`;
  const event_location = `${volume?.venue_neighborhood || 'Twin Peaks'}, SF`;
  const event_time = `${volume?.doors_time_start || '6:00 — 9:00 PM'}`;

  // 2. Replace tokens
  let interpolated = html
    .replace('{{user_name}}', mockData.user_name)
    .replace('{{friend_name}}', mockData.friend_name)
    .replace('{{friend_initials}}', mockData.friend_initials)
    .replace('{{submitted_time}}', mockData.submitted_time)
    .replace('{{user_email}}', mockData.user_email)
    .replace('{{friend_email}}', mockData.friend_email)
    .replace('{{volume_name}}', volume_name)
    .replace('{{event_date}}', mockData.event_date)
    .replace('{{event_location}}', event_location)
    .replace('{{event_time}}', event_time);

  // 3. Extract styles and body
  const styles = extractStyles(interpolated);
  const body = extractBody(interpolated);

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
