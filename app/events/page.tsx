import { readFileSync } from 'node:fs';
import path from 'node:path';
import { listVolumes, getVolumeSeats } from '@/app/lib/supabase';

export default async function EventsPage() {
  // 1. Read the static HTML file
  const html = readFileSync(
    path.join(process.cwd(), 'public', 'events.html'),
    'utf8'
  );

  // 2. Fetch all volumes
  const volumes = await listVolumes();

  // 3. Generate volume list HTML
  const volumeListHtml = await Promise.all(
    volumes.map(async (volume) => {
      const seats = await getVolumeSeats(volume.id);
      const volNum = volume.id.split('-')[1]; // Extract "01" from "vol-01"

      return `
        <a class="event-row" href="/apply">
          <div class="event-row__vol">${volNum}</div>
          <div class="event-row__title">
            ${volume.name}
            <small>Vol. ${volNum}</small>
          </div>
          <div class="event-row__meta">
            <strong>When</strong>
            ${formatDate(volume.doors_date)}<br/>${volume.doors_time_start}
          </div>
          <div class="event-row__meta">
            <strong>Where</strong>
            ${volume.venue_neighborhood}<br/>San Francisco
          </div>
          <span class="event-row__status ${getStatusClass(seats.remaining)}">
            ${getStatusLabel(seats.remaining, seats.total)}
          </span>
        </a>
      `;
    })
  );

  // 4. Replace token
  const interpolated = html.replace(
    '{{volume_list}}',
    volumeListHtml.join('\n')
  );

  // 5. Extract styles and body
  const styles = extractStyles(interpolated);
  const body = extractBody(interpolated);

  // 6. Render
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
    month: 'short',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Determine status class based on remaining seats
 */
function getStatusClass(remaining: number): string {
  if (remaining > 0) return 'event-row__status--open';
  return 'event-row__status--soon';
}

/**
 * Generate status label
 */
function getStatusLabel(remaining: number, total: number): string {
  if (remaining > 0) {
    return `<span class="pulse"></span> ${remaining} of ${total} seats`;
  }
  return 'Waitlist opens soon';
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
