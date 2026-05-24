import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events — Doubles',
  description: 'Upcoming and past Doubles events for founders and investors.',
};

export default function EventsPage() {
  return (
    <div className="container" style={{ minHeight: '60vh', paddingTop: '80px', paddingBottom: '80px' }}>
      <h1>Upcoming Events</h1>
      <p style={{ marginTop: '16px', color: 'var(--ink-soft)', marginBottom: '48px' }}>
        Vol. 01 is coming June 21.
      </p>
      <div className="grid grid--2col">
        <div className="card">
          <div className="card__header" style={{ backgroundColor: 'var(--teal)', color: 'white', padding: '24px', borderRadius: 'var(--r-card)' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>VOL. 01</span>
            <h3 style={{ margin: '8px 0 0', color: 'inherit' }}>Founding Launch</h3>
          </div>
          <div style={{ padding: '24px' }}>
            <p><strong>Saturday, June 21</strong></p>
            <p style={{ color: 'var(--ink-soft)', fontSize: '14px' }}>6:00 – 9:00 PM</p>
            <p style={{ color: 'var(--ink-soft)', fontSize: '14px', marginTop: '8px' }}>Twin Peaks, San Francisco</p>
          </div>
        </div>
      </div>
    </div>
  );
}
