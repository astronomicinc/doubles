'use client';
import Link from 'next/link';

export default function TermsPage() {
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
            <span className="eyebrow"><span className="ball"></span> Terms</span>
            <h1>Terms of <em>Service</em></h1>
          </div>
          <p className="page-header__sub">The basics. We keep it simple.</p>
        </div>
      </header>

      <section className="section section--cream">
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 className="t-h3" style={{ marginBottom: '32px' }}>Agreement</h2>
          <p style={{ fontSize: '16px', lineHeight: '1.65', color: 'var(--ink-soft)', marginBottom: '32px' }}>
            By applying for Doubles events, you agree to our Code of Conduct and these terms of service. We reserve the right to refuse admission to anyone who violates our community standards.
          </p>

          <h2 className="t-h3" style={{ marginBottom: '32px' }}>Payment</h2>
          <p style={{ fontSize: '16px', lineHeight: '1.65', color: 'var(--ink-soft)', marginBottom: '32px' }}>
            Payment is $145 per person per event. Cancellations made 7+ days in advance receive a full refund. Cancellations within 7 days are non-refundable.
          </p>

          <h2 className="t-h3" style={{ marginBottom: '32px' }}>Conduct</h2>
          <p style={{ fontSize: '16px', lineHeight: '1.65', color: 'var(--ink-soft)', marginBottom: '16px' }}>
            Be respectful. Be genuine. Respect boundaries. No sales pitches. What happens at Doubles stays at Doubles.
          </p>
          <p style={{ fontSize: '16px', lineHeight: '1.65', color: 'var(--ink-soft)', marginBottom: '32px' }}>
            Violations of our code of conduct may result in permanent removal from future events.
          </p>

          <h2 className="t-h3" style={{ marginBottom: '32px' }}>Liability</h2>
          <p style={{ fontSize: '16px', lineHeight: '1.65', color: 'var(--ink-soft)' }}>
            Doubles hosts dating events and is not responsible for the actions or conduct of attendees. Attend at your own risk.
          </p>
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
