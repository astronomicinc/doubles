'use client';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <>
      <nav className="nav">
        <div className="nav__inner">
          <Link href="/" className="nav__logo"><span className="nav__logo-dot"></span><span>DOUBLES</span></Link>
          <ul className="nav__links">
            <li><Link href="/apply">Apply</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
          <Link href="/apply" className="btn btn--coral btn--sm">Join the list →</Link>
        </div>
      </nav>

      <header className="page-header">
        <div className="page-header__inner">
          <div>
            <span className="eyebrow"><span className="ball"></span> Privacy</span>
            <h1>Your data is <em>yours</em></h1>
          </div>
          <p className="page-header__sub">We take privacy seriously. Here's how we protect it.</p>
        </div>
      </header>

      <section className="section section--cream">
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 className="t-h3" style={{ marginBottom: '32px' }}>Our commitment</h2>
          <p style={{ fontSize: '16px', lineHeight: '1.65', color: 'var(--ink-soft)', marginBottom: '24px' }}>
            We don't sell your data. We don't share attendee lists with third parties. We don't use your information for marketing beyond the Doubles community.
          </p>
          <p style={{ fontSize: '16px', lineHeight: '1.65', color: 'var(--ink-soft)', marginBottom: '32px' }}>
            Your information is used only to run the Doubles community, process payments, send event details, and improve our service.
          </p>

          <h2 className="t-h3" style={{ marginBottom: '32px', marginTop: '60px' }}>What we collect</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <li style={{ display: 'flex', gap: '12px', fontSize: '15px', color: 'var(--ink-soft)' }}>
              <span style={{ flex: 'none' }}>•</span>
              <span>Name, email, and phone number for event communication</span>
            </li>
            <li style={{ display: 'flex', gap: '12px', fontSize: '15px', color: 'var(--ink-soft)' }}>
              <span style={{ flex: 'none' }}>•</span>
              <span>Application information to review for event suitability</span>
            </li>
            <li style={{ display: 'flex', gap: '12px', fontSize: '15px', color: 'var(--ink-soft)' }}>
              <span style={{ flex: 'none' }}>•</span>
              <span>Payment information processed securely by Stripe</span>
            </li>
            <li style={{ display: 'flex', gap: '12px', fontSize: '15px', color: 'var(--ink-soft)' }}>
              <span style={{ flex: 'none' }}>•</span>
              <span>Attendance history for community management</span>
            </li>
          </ul>

          <h2 className="t-h3" style={{ marginBottom: '32px', marginTop: '60px' }}>Your rights</h2>
          <p style={{ fontSize: '16px', lineHeight: '1.65', color: 'var(--ink-soft)' }}>
            You have the right to access, correct, or delete your personal data at any time. Contact us at hello@doubles.singles.
          </p>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer__bottom">
            <div className="tag"><span className="ball"></span> © 2024 Doubles, Inc.</div>
            <div className="tag"><Link href="/terms">Terms</Link> <Link href="/privacy">Privacy</Link></div>
          </div>
        </div>
      </footer>
    </>
  );
}
