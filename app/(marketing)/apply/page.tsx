import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apply — Doubles',
  description: 'Apply for an exclusive dating event for founders and investors.',
};

export default function ApplyPage() {
  return (
    <div className="container">
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1>Apply for Vol. 01</h1>
          <p style={{ marginTop: '16px', color: 'var(--ink-soft)' }}>
            Application form coming soon. Check back in a moment.
          </p>
        </div>
      </div>
    </div>
  );
}
