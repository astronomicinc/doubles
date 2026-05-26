import { readFileSync } from 'node:fs';
import path from 'node:path';
import { getVolumeRecap, getVolumeDetails, getNextVolume } from '@/app/lib/supabase';

export default async function RecapPage({
  params,
}: {
  params: { volumeId: string };
}) {
  // 1. Read the static HTML file (using vol-01 as template)
  const html = readFileSync(
    path.join(process.cwd(), 'public', 'recap-vol-01.html'),
    'utf8'
  );

  // 2. Fetch volume data
  const volumeId = params.volumeId || 'vol-01';
  const recap = await getVolumeRecap(volumeId);
  const volume = await getVolumeDetails(volumeId);
  const nextVolume = await getNextVolume();

  if (!recap || !volume) {
    return <div>Volume not found</div>;
  }

  // Extract volume number from ID (e.g., "vol-01" → "01")
  const volNum = volumeId.split('-')[1] || '01';

  // Format dates
  const volumeDate = formatDate(volume.doors_date);
  const nextVolDate = nextVolume ? formatDate(nextVolume.doors_date) : 'TBA';

  // 3. Replace tokens
  let interpolated = html
    .replace('{{volume_label}}', `Vol. ${volNum}`)
    .replace('{{volume_name}}', volume.name)
    .replace('{{venue_location}}', `${volume.venue_neighborhood}, San Francisco`)
    .replace('{{volume_date}}', `${volumeDate}`)
    .replace('{{volume_num}}', `Vol. <em>${volNum}</em>`)
    .replace('{{venue_name}}', volume.venue_neighborhood)
    .replace('{{attendee_count}}', String(recap.attendeeCount || 30))
    .replace('{{next_volume_label}}', nextVolume ? `Vol. ${getNextVolumeNum(nextVolume.id)} · ${nextVolDate}` : 'Next volume TBA');

  // 4. Extract styles and body
  const styles = extractStyles(interpolated);
  const body = extractBody(interpolated);

  // 5. Render
  const content = styles + body;
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}

/**
 * Format date string to human-readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  };
  return `${date.toLocaleDateString('en-US', options)}`;
}

/**
 * Extract volume number from ID
 */
function getNextVolumeNum(volumeId: string): string {
  return volumeId.split('-')[1] || '02';
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
