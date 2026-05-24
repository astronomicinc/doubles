import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Volley — Doubles',
  description: 'Learn about the Volley format that makes Doubles unique.',
};

export default function VolleyPage() {
  return (
    <div className="container" style={{ minHeight: '60vh', paddingTop: '80px', paddingBottom: '80px' }}>
      <h1>The Volley</h1>
      <p style={{ marginTop: '16px', color: 'var(--ink-soft)', marginBottom: '48px' }}>
        The Volley is the opener. A fireside chat and Q&A with an accomplished founder or operator—45 minutes total.
      </p>
      <div style={{ maxWidth: '700px' }}>
        <h3 style={{ marginTop: '32px' }}>6:00–6:15 PM: Fireside Chat</h3>
        <p style={{ marginTop: '12px', color: 'var(--ink-soft)' }}>
          Conversation with a guest speaker. The theme changes per volume.
        </p>

        <h3 style={{ marginTop: '32px' }}>6:15–7:00 PM: Q&A</h3>
        <p style={{ marginTop: '12px', color: 'var(--ink-soft)' }}>
          You ask the questions. Direct, no-BS conversation.
        </p>

        <h3 style={{ marginTop: '32px' }}>7:00 PM Onwards: Dinner & Mingling</h3>
        <p style={{ marginTop: '12px', color: 'var(--ink-soft)' }}>
          Wine, food, and a room full of people you actually want to talk to.
        </p>
      </div>
    </div>
  );
}
