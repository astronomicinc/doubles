'use client';

import Link from 'next/link';

const faqs = [
  {
    q: 'How does the application process work?',
    a: 'Apply online, tell us about yourself. We review within 48 hours. If approved, choose a volume, complete payment ($145/person), and you\'re in.'
  },
  {
    q: 'What do you mean by "bring a friend"?',
    a: 'Bring a single friend you know and vouch for. They\'re vetted through you—your reputation is on the line. This ensures everyone in the room is genuinely thoughtful.'
  },
  {
    q: 'Is this a networking event?',
    a: 'No. This is a dating event. We ask you not to pitch your company, your fund, or your product. Talk about your life, your interests, what matters to you.'
  },
  {
    q: 'How many people attend?',
    a: 'Exactly 30 people per event. That\'s 15 pairs. Small enough to have real conversations, big enough to make meaningful connections.'
  },
  {
    q: 'What if I don\'t find anyone?',
    a: 'That\'s okay. Come for the room, stay for the experience. But we think you will.'
  },
  {
    q: 'Can I bring multiple friends?',
    a: 'No. One friend per attendee. This keeps the math simple and the room intentional.'
  },
  {
    q: 'What happens to my data?',
    a: 'We take privacy seriously. We don\'t sell your data. We don\'t share attendee lists. Read our privacy policy for details.'
  },
  {
    q: 'Can I attend multiple events?',
    a: 'Yes. We encourage repeat attendance. The community gets stronger as people return.'
  },
];

export default function FAQPage() {
  return (
    <>
      <nav className="nav">
        <div className="nav__inner">
          <Link href="/" className="nav__logo"><span className="nav__logo-dot"></span><span>DOUBLES</span></Link>
          <ul className="nav__links">
            <li><Link href="/events">Events</Link></li>
            <li><Link href="/apply">Apply</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/faq" aria-current="page">FAQ</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
          <Link href="/apply" className="btn btn--coral btn--sm">Join the list →</Link>
        </div>
      </nav>

      <header className="page-header">
        <div className="page-header__inner">
          <div>
            <span className="eyebrow"><span className="ball"></span> Questions?</span>
            <h1>Frequently asked <em>questions</em></h1>
          </div>
          <p className="page-header__sub">
            Everything you need to know about how Doubles works, what to expect, and how we protect your privacy.
          </p>
        </div>
      </header>

      <section className="section section--cream">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {faqs.map((faq, i) => (
              <details key={i} style={{ cursor: 'pointer', borderBottom: '1px solid var(--line)', paddingBottom: '24px' }}>
                <summary style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontWeight: 'var(--w-serif-medium)', color: 'var(--ink)', listStyle: 'none', outline: 'none' }}>
                  {faq.q}
                </summary>
                <p style={{ fontSize: '15px', lineHeight: '1.65', color: 'var(--ink-soft)', marginTop: '16px', marginBottom: '0' }}>
                  {faq.a}
                </p>
              </details>
            ))}
          </div>

          <div style={{ marginTop: '80px', padding: '48px', background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-deep) 100%)', borderRadius: 'var(--r-card)', color: 'var(--cream)', textAlign: 'center' }}>
            <h2 className="t-h3" style={{ color: 'var(--cream)', marginBottom: '16px' }}>Still have questions?</h2>
            <p style={{ fontSize: '15px', lineHeight: '1.6', margin: '0 0 24px', maxWidth: '56ch', marginLeft: 'auto', marginRight: 'auto' }}>
              Drop us a line. We read every message and respond within 24 hours.
            </p>
            <Link href="/contact" className="btn btn--ghost">
              Get in touch →
            </Link>
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
                <li><Link href="/faq">FAQ</Link></li>
              </ul>
            </div>
            <div className="footer__col">
              <h4>Learn</h4>
              <ul>
                <li><Link href="/about">About</Link></li>
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
          </div>
        </div>
      </footer>
    </>
  );
}
