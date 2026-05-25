'use client';
import Link from 'next/link';

export default function CodeOfConductPage() {
  return (
    <>
      <nav className="nav">
        <div className="nav__inner">
          <Link href="/" className="nav__logo"><span className="nav__logo-dot"></span> <span>DOUBLES</span></Link>
          <ul className="nav__links">
            <li><Link href="/events">Events</Link></li>
            <li><Link href="/apply">Apply</Link></li>
            <li><Link href="/about">About</Link></li>
          </ul>
          <Link href="/apply" className="btn btn--coral btn--sm">Join the list →</Link>
        </div>
      </nav>

      <header className="page-header">
        <div className="page-header__inner">
          <div>
            <span className="eyebrow"><span className="ball"></span> Community</span>
            <h1>Code of <em>Conduct</em></h1>
          </div>
          <p className="page-header__sub">The simple principles that make Doubles work for everyone.</p>
        </div>
      </header>

      <section className="section section--cream">
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 className="t-h2" style={{ marginBottom: '32px' }}>Our principles</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 'var(--w-serif-medium)', color: 'var(--ink)', marginBottom: '16px' }}>Be genuine</h3>
              <p style={{ fontSize: '16px', lineHeight: '1.65', color: 'var(--ink-soft)' }}>Show up as yourself. Share your real story. Listen with genuine interest. Authenticity is what makes these evenings special.</p>
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 'var(--w-serif-medium)', color: 'var(--ink)', marginBottom: '16px' }}>Respect boundaries</h3>
              <p style={{ fontSize: '16px', lineHeight: '1.65', color: 'var(--ink-soft)' }}>Everyone here has chosen to be present and open. Honor that choice. If someone isn't interested, move on gracefully.</p>
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 'var(--w-serif-medium)', color: 'var(--ink)', marginBottom: '16px' }}>No sales pitches</h3>
              <p style={{ fontSize: '16px', lineHeight: '1.65', color: 'var(--ink-soft)' }}>This isn't a networking event. Don't pitch your startup, your fund, or your services. Talk about your life, your interests, and what matters to you.</p>
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 'var(--w-serif-medium)', color: 'var(--ink)', marginBottom: '16px' }}>Privacy matters</h3>
              <p style={{ fontSize: '16px', lineHeight: '1.65', color: 'var(--ink-soft)' }}>Don't share who was at the event or what someone told you in conversation. What happens at Doubles stays at Doubles.</p>
            </div>
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
