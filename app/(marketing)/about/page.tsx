import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — Doubles',
  description: 'The story behind Doubles: exclusive dating events for founders and investors.',
};

export default function AboutPage() {
  return (
    <div className="container" style={{ minHeight: '60vh', paddingTop: '80px', paddingBottom: '80px' }}>
      <h1>Our Story</h1>
      <div style={{ maxWidth: '700px', marginTop: '32px' }}>
        <p style={{ fontSize: '18px', lineHeight: '1.65', marginBottom: '24px' }}>
          Doubles exists because the best relationships start with the best people. Not algorithms. Not swipes. Real introductions from people who know you.
        </p>
        <p style={{ fontSize: '18px', lineHeight: '1.65', color: 'var(--ink-soft)' }}>
          We're building a community where successful founders, investors, and operators can meet intentionally—in a room designed for real connection.
        </p>
      </div>
    </div>
  );
}
