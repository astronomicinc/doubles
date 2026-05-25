'use client';

import Link from 'next/link';

export default function StatusPage() {
  return (
    <>
      {/* NAV */}
      <nav className="nav">
        <div className="nav__inner">
          <Link href="/" className="nav__logo" aria-label="Doubles">
            <span className="nav__logo-dot" aria-hidden="true"></span>
            <span>DOUBLES</span>
          </Link>
          <ul className="nav__links">
            <li><Link href="/status" aria-current="page">My status</Link></li>
            <li><Link href="/events">Events</Link></li>
            <li><Link href="/matches">Matches</Link></li>
          </ul>
          <button className="btn btn--ghost btn--sm">Sign out</button>
        </div>
      </nav>

      {/* PAGE HEADER */}
      <header className="page-header">
        <div className="page-header__inner">
          <div>
            <span className="eyebrow"><span className="ball"></span> Your status</span>
            <h1>You're all <em>set</em></h1>
          </div>
          <p className="page-header__sub">
            Everything you need to know about your event, what to expect, and how to prepare.
          </p>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <section className="section section--cream">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '60px', alignItems: 'start' }}>
            {/* MAIN */}
            <div>
              {/* EVENT CARD */}
              <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 'var(--r-card)', padding: '40px', marginBottom: '60px' }}>
                <span className="eyebrow"><span className="ball"></span> Vol. 01 — Founding Launch</span>
                <h2 className="t-h3" style={{ marginTop: '18px' }}>Saturday, June 21</h2>

                <dl className="event-meta" style={{ marginTop: '32px' }}>
                  <dt>Date & Time</dt>
                  <dd>Saturday, June 21 · 6:00 PM – 9:00 PM</dd>
                  <dt>Location</dt>
                  <dd>Twin Peaks House, San Francisco</dd>
                  <dt>Dress Code</dt>
                  <dd>Smart casual, no sneakers</dd>
                </dl>

                <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid var(--line)' }}>
                  <h3 style={{ fontFamily: 'var(--serif)', fontSize: '18px', fontWeight: 'var(--w-serif-medium)', color: 'var(--ink)', margin: '0 0 16px' }}>What to expect</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li style={{ display: 'flex', gap: '12px', fontSize: '14px', color: 'var(--ink-soft)' }}>
                      <span style={{ flex: 'none' }}>•</span>
                      <span>6:00 PM: Arrival & check-in with cocktails</span>
                    </li>
                    <li style={{ display: 'flex', gap: '12px', fontSize: '14px', color: 'var(--ink-soft)' }}>
                      <span style={{ flex: 'none' }}>•</span>
                      <span>6:30 PM: Welcome & founder keynote (5 min)</span>
                    </li>
                    <li style={{ display: 'flex', gap: '12px', fontSize: '14px', color: 'var(--ink-soft)' }}>
                      <span style={{ flex: 'none' }}>•</span>
                      <span>6:40 PM: Open conversation & mingling</span>
                    </li>
                    <li style={{ display: 'flex', gap: '12px', fontSize: '14px', color: 'var(--ink-soft)' }}>
                      <span style={{ flex: 'none' }}>•</span>
                      <span>9:00 PM: Event concludes</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* YOUR FRIEND */}
              <div style={{ marginBottom: '60px' }}>
                <h2 className="t-h3" style={{ marginBottom: '32px' }}>Your plus-one</h2>
                <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 'var(--r-card)', padding: '40px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '32px', alignItems: 'start' }}>
                  <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-deep) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cream)', fontSize: '48px', fontWeight: 'bold', flex: 'none' }}>
                    JD
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 'var(--w-serif-medium)', color: 'var(--ink)', margin: '0 0 8px' }}>Jane Doe</h3>
                    <p style={{ fontSize: '14px', color: 'var(--ink-soft)', margin: '0 0 16px' }}>Founder of Acme Inc. · SF</p>
                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--ink-soft)', margin: '0' }}>You invited Jane because she's thoughtful, ambitious, and genuinely great at conversations.</p>
                  </div>
                </div>
              </div>

              {/* PREPARATION GUIDE */}
              <div>
                <h2 className="t-h3" style={{ marginBottom: '32px' }}>Before you arrive</h2>
                <div style={{ background: 'var(--cream-warm)', border: '1px solid var(--line)', borderRadius: 'var(--r-card)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--line)' }}>
                    <h4 style={{ fontFamily: 'var(--serif)', fontSize: '18px', fontWeight: 'var(--w-serif-medium)', color: 'var(--ink)', margin: '0 0 8px' }}>Read the code of conduct</h4>
                    <p style={{ fontSize: '14px', color: 'var(--ink-soft)', margin: '0' }}>
                      A few agreements that make Doubles work. <Link href="/code-of-conduct" style={{ color: 'var(--teal)', fontWeight: 'var(--w-sans-bold)' }}>Read it here</Link>.
                    </p>
                  </div>
                  <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--line)' }}>
                    <h4 style={{ fontFamily: 'var(--serif)', fontSize: '18px', fontWeight: 'var(--w-serif-medium)', color: 'var(--ink)', margin: '0 0 8px' }}>Prepare your story</h4>
                    <p style={{ fontSize: '14px', color: 'var(--ink-soft)', margin: '0' }}>
                      What are you building? What matters to you? Think about how to share that authentically in conversation.
                    </p>
                  </div>
                  <div>
                    <h4 style={{ fontFamily: 'var(--serif)', fontSize: '18px', fontWeight: 'var(--w-serif-medium)', color: 'var(--ink)', margin: '0 0 8px' }}>Bring good energy</h4>
                    <p style={{ fontSize: '14px', color: 'var(--ink-soft)', margin: '0' }}>
                      Everyone's here for real connection. Ask good questions. Listen. Be genuinely interested in people.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SIDEBAR */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* TICKET INFO */}
              <div style={{ background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-deep) 100%)', color: 'var(--cream)', borderRadius: 'var(--r-card)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 'var(--w-serif-medium)', color: 'var(--cream)', margin: '0' }}>Your ticket</h3>
                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'var(--w-sans-bold)', letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.8, marginBottom: '4px' }}>Ticket ID</div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: '18px', fontWeight: 'var(--w-serif-medium)' }}>DBL-001-2024</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 'var(--w-sans-bold)', letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.8, marginBottom: '4px' }}>Price</div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: '18px', fontWeight: 'var(--w-serif-medium)' }}>$145</div>
                  </div>
                </div>
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(245, 241, 232, 0.2)' }}>
                  <button style={{ width: '100%', padding: '12px 16px', background: 'var(--ball)', color: 'var(--ink)', borderRadius: 'var(--r-pill)', fontSize: '13px', fontWeight: 'var(--w-sans-bold)', letterSpacing: '0.16em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>
                    Download ticket
                  </button>
                </div>
              </div>

              {/* ADDRESS REVEAL */}
              <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 'var(--r-card)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 'var(--w-serif-medium)', color: 'var(--ink)', margin: '0' }}>Address reveal</h3>
                <p style={{ fontSize: '14px', color: 'var(--ink-soft)', margin: '0' }}>
                  The full address will be sent to your phone 24 hours before the event.
                </p>
                <div style={{ marginTop: '8px', padding: '16px', background: 'var(--cream-warm)', borderRadius: '4px', fontSize: '14px', color: 'var(--ink-soft)' }}>
                  📍 Arriving by phone: +1 (415) 000-0000
                </div>
              </div>

              {/* SUPPORT */}
              <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 'var(--r-card)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 'var(--w-serif-medium)', color: 'var(--ink)', margin: '0' }}>Need help?</h3>
                <p style={{ fontSize: '14px', color: 'var(--ink-soft)', margin: '0' }}>
                  Questions about the event? <Link href="/contact" style={{ color: 'var(--teal)', fontWeight: 'var(--w-sans-bold)' }}>Get in touch</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer__bottom">
            <div className="tag">
              <span className="ball"></span>
              <span>© 2024 Doubles, Inc.</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
