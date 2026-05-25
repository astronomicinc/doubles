'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      <nav className="nav">
        <div className="nav__inner">
          <Link href="/" className="nav__logo" aria-label="Doubles">
            <span className="nav__logo-dot" aria-hidden="true"></span>
            <span>DOUBLES</span>
          </Link>
          <ul className="nav__links">
            <li><Link href="/events">Events</Link></li>
            <li><Link href="/apply">Apply</Link></li>
            <li><Link href="/volley">Volley</Link></li>
            <li><Link href="/about" aria-current="page">About</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
          <Link href="/apply" className="btn btn--coral btn--sm">Join the list →</Link>
        </div>
      </nav>

      <header className="page-header">
        <div className="page-header__inner">
          <div>
            <span className="eyebrow"><span className="ball"></span> Our story</span>
            <h1>Why we built <em>Doubles</em></h1>
          </div>
          <p className="page-header__sub">
            A better way for ambitious people to meet. Built on trust, not algorithms.
            Curated, intentional, and designed for real connection.
          </p>
        </div>
      </header>

      <section className="section section--cream">
        <div className="container" style={{ maxWidth: '900px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '60px', alignItems: 'start', marginBottom: '80px' }}>
            <div>
              <h2 className="t-h2" style={{ marginBottom: '32px' }}>The problem</h2>
              <p style={{ fontSize: '17px', lineHeight: '1.65', color: 'var(--ink-soft)', marginBottom: '24px' }}>
                If you're a successful founder or investor, dating is hard. Dating apps are full of people looking for attention. Networking events feel transactional. And traditional matchmakers are expensive and invasive.
              </p>
              <p style={{ fontSize: '17px', lineHeight: '1.65', color: 'var(--ink-soft)' }}>
                We built Doubles because we believed there had to be a better way.
              </p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-deep) 100%)', color: 'var(--cream)', borderRadius: 'var(--r-card)', padding: '48px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 'var(--w-sans-bold)', letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.8, marginBottom: '8px' }}>Founded</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 'var(--w-serif-medium)' }}>May 2024</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 'var(--w-sans-bold)', letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.8, marginBottom: '8px' }}>Location</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 'var(--w-serif-medium)' }}>San Francisco</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 'var(--w-sans-bold)', letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.8, marginBottom: '8px' }}>Mission</div>
                <div style={{ fontSize: '16px', lineHeight: '1.6' }}>Create the default way successful people meet.</div>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '60px', borderTop: '1px solid var(--line)' }}>
            <h2 className="t-h2" style={{ marginBottom: '32px' }}>Our values</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 'var(--w-serif-medium)', color: 'var(--ink)', marginBottom: '16px' }}>Curation</h3>
                <p style={{ fontSize: '15px', lineHeight: '1.65', color: 'var(--ink-soft)', margin: '0' }}>
                  We're selective about who we invite. Not because we're snobby, but because quality matters. Everyone deserves a room full of thoughtful people.
                </p>
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 'var(--w-serif-medium)', color: 'var(--ink)', marginBottom: '16px' }}>Intention</h3>
                <p style={{ fontSize: '15px', lineHeight: '1.65', color: 'var(--ink-soft)', margin: '0' }}>
                  Everyone here chose to be present. We're not optimizing for casual swipes. We're optimizing for real connection.
                </p>
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 'var(--w-serif-medium)', color: 'var(--ink)', marginBottom: '16px' }}>Trust</h3>
                <p style={{ fontSize: '15px', lineHeight: '1.65', color: 'var(--ink-soft)', margin: '0' }}>
                  Your friend vouches for you. That means more than any algorithm ever could. Trust is our moat.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer__grid">
            <div className="footer__brand">
              <Link href="/" className="nav__logo"><span className="nav__logo-dot"></span><span>DOUBLES</span></Link>
              <p className="footer__tag">Strategy. Partnership. Connection.</p>
            </div>
            <div className="footer__col">
              <h4>Discover</h4>
              <ul>
                <li><Link href="/events">Events</Link></li>
                <li><Link href="/apply">Apply</Link></li>
                <li><Link href="/about">About</Link></li>
              </ul>
            </div>
            <div className="footer__col">
              <h4>Learn</h4>
              <ul>
                <li><Link href="/faq">FAQ</Link></li>
                <li><Link href="/privacy">Privacy</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
            <div className="footer__newsletter">
              <h4>Updates</h4>
              <p>Get event announcements.</p>
              <form onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="your@email.com" required aria-label="Email address" />
                <button type="submit">Subscribe</button>
              </form>
            </div>
          </div>
          <div className="footer__bottom">
            <div className="tag"><span className="ball"></span> © 2024 Doubles, Inc.</div>
            <div className="tag"><Link href="/terms">Terms</Link> <Link href="/privacy">Privacy</Link></div>
          </div>
        </div>
      </footer>
    </>
  );
}
