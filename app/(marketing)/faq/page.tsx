import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — Doubles',
  description: 'Frequently asked questions about Doubles events.',
};

export default function FAQPage() {
  return (
    <div className="container" style={{ minHeight: '60vh', paddingTop: '80px', paddingBottom: '80px' }}>
      <h1>Frequently Asked Questions</h1>
      <div style={{ maxWidth: '700px', marginTop: '48px' }}>
        <div style={{ marginBottom: '48px' }}>
          <h3>Who can apply?</h3>
          <p style={{ marginTop: '12px', color: 'var(--ink-soft)' }}>
            Post-exit founders, investors, and high-earning operators in the SF tech scene who are single and looking to meet quality people.
          </p>
        </div>

        <div style={{ marginBottom: '48px' }}>
          <h3>Why bring a friend?</h3>
          <p style={{ marginTop: '12px', color: 'var(--ink-soft)' }}>
            Your friend vouches for you. Their reputation is on the line. This is better vetting than any app.
          </p>
        </div>

        <div style={{ marginBottom: '48px' }}>
          <h3>How much does it cost?</h3>
          <p style={{ marginTop: '12px', color: 'var(--ink-soft)' }}>
            $145 per person. That's $290 per pair. You're paying for curation, venue, catering, and a room full of people who were actually vetted.
          </p>
        </div>

        <div style={{ marginBottom: '48px' }}>
          <h3>What if I get rejected?</h3>
          <p style={{ marginTop: '12px', color: 'var(--ink-soft)' }}>
            Full refund. No questions asked. We'll automatically roll your application to the next volume.
          </p>
        </div>
      </div>
    </div>
  );
}
