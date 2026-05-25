'use client';
import Link from 'next/link';

export default function EventsPage() {
  return (
    <>
      <nav className="nav">
        <div className="nav__inner">
          <Link href="/" className="nav__logo"><span className="nav__logo-dot"></span><span>DOUBLES</span></Link>
          <ul className="nav__links">
            <li><Link href="/events" aria-current="page">Events</Link></li>
            <li><Link href="/apply">Apply</Link></li>
            <li><Link href="/about">About</Link></li>
          </ul>
          <Link href="/apply" className="btn btn--coral btn--sm">Join the list →</Link>
        </div>
      </nav>

      <header className="page-header">
        <div className="page-header__inner">
          <div>
            <span className="eyebrow"><span className="ball"></span> Upcoming</span>
            <h1>Doubles <em>events</em></h1>
          </div>
          <p className="page-header__sub">Our calendar of upcoming dating events in San Francisco.</p>
        </div>
      </header>

      <section className="section section--cream">
        <div className="container">
          <h2 className="t-h3" style={{ marginBottom: '48px' }}>Vol. 01 — Founding Launch</h2>
          <article className="event-card">
            <div className="event-card__photo" role="img" aria-label="Twin Peaks">
              <span className="event-tag"><span className="pulse"></span> Applications open</span>
            </div>
            <div className="event-card__body">
              <span className="eyebrow">Our first event</span>
              <h2>An evening <em>worth showing up for</em>.</h2>
              <dl className="event-meta">
                <dt>Date</dt> <dd>Saturday, June 21</dd>
                <dt>Time</dt> <dd>6:00 — 9:00 PM</dd>
                <dt>Location</dt> <dd>Twin Peaks House, SF</dd>
              </dl>
              <ul className="event-features">
                <li><span className="ball-dot"></span> 30 hand-picked singles</li>
                <li><span className="ball-dot"></span> Catered bites & cocktails</li>
                <li><span className="ball-dot"></span> Real conversation</li>
              </ul>
              <div className="event-actions">
                <Link href="/apply" className="btn btn--coral">Reserve your spot →</Link>
                <span className="note">12 of 30 seats remain</span>
              </div>
            </div>
          </article>

          <div style={{ marginTop: '80px', padding: '48px', background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-deep) 100%)', borderRadius: 'var(--r-card)', color: 'var(--cream)', textAlign: 'center' }}>
            <h2 className="t-h3" style={{ color: 'var(--cream)', marginBottom: '16px' }}>Want to know about future events?</h2>
            <p style={{ fontSize: '15px', margin: '0 0 24px' }}>Subscribe to our newsletter for announcements.</p>
            <form onSubmit={(e) => e.preventDefault()} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
              <input type="email" placeholder="your@email.com" required style={{ padding: '12px 16px', borderRadius: '4px', border: 'none', fontSize: '14px', minWidth: '200px' }} />
              <button type="submit" style={{ padding: '12px 24px', background: 'var(--ball)', color: 'var(--ink)', borderRadius: 'var(--r-pill)', fontSize: '12px', fontWeight: 'var(--w-sans-bold)', border: 'none', cursor: 'pointer' }}>Subscribe</button>
            </form>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer__bottom">
            <div className="tag"><span className="ball"></span> © 2024 Doubles, Inc.</div>
          </div>
        </div>
      </footer>
    </>
  );
}
