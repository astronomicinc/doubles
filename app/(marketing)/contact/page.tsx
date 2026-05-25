'use client';

import Link from 'next/link';

export default function ContactPage() {
  return (
    <>
      <nav className="nav">
        <div className="nav__inner">
          <Link href="/" className="nav__logo"><span className="nav__logo-dot"></span><span>DOUBLES</span></Link>
          <ul className="nav__links">
            <li><Link href="/events">Events</Link></li>
            <li><Link href="/apply">Apply</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact" aria-current="page">Contact</Link></li>
          </ul>
          <Link href="/apply" className="btn btn--coral btn--sm">Join the list →</Link>
        </div>
      </nav>

      <header className="page-header">
        <div className="page-header__inner">
          <div>
            <span className="eyebrow"><span className="ball"></span> Get in touch</span>
            <h1>We're always <em>listening</em></h1>
          </div>
          <p className="page-header__sub">
            Have a question about an event? Want to suggest a speaker? Found a bug? We read every message.
          </p>
        </div>
      </header>

      <section className="section section--cream">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '60px', alignItems: 'start' }}>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '15px', fontWeight: 'var(--w-sans-bold)', color: 'var(--ink)' }}>Name</label>
                <input type="text" placeholder="Your name" required style={{ padding: '12px 16px', border: '1px solid var(--line)', borderRadius: '4px', fontSize: '15px', fontFamily: 'var(--sans)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '15px', fontWeight: 'var(--w-sans-bold)', color: 'var(--ink)' }}>Email</label>
                <input type="email" placeholder="your@email.com" required style={{ padding: '12px 16px', border: '1px solid var(--line)', borderRadius: '4px', fontSize: '15px', fontFamily: 'var(--sans)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '15px', fontWeight: 'var(--w-sans-bold)', color: 'var(--ink)' }}>Message</label>
                <textarea placeholder="What's on your mind?" rows={6} required style={{ padding: '12px 16px', border: '1px solid var(--line)', borderRadius: '4px', fontSize: '15px', fontFamily: 'var(--sans)', resize: 'vertical' }} ></textarea>
              </div>
              <button type="submit" className="btn btn--coral">
                Send message →
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 'var(--r-card)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontWeight: 'var(--w-serif-medium)', color: 'var(--ink)', margin: '0' }}>Response time</h3>
                <p style={{ fontSize: '14px', color: 'var(--ink-soft)', margin: '0' }}>
                  We read and respond to all messages within 24 hours. Usually faster.
                </p>
              </div>

              <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 'var(--r-card)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontWeight: 'var(--w-serif-medium)', color: 'var(--ink)', margin: '0' }}>Other ways</h3>
                <p style={{ fontSize: '14px', color: 'var(--ink-soft)', margin: '0' }}>
                  Email: <a href="mailto:hello@doubles.singles" style={{ color: 'var(--teal)', fontWeight: 'var(--w-sans-bold)' }}>hello@doubles.singles</a>
                </p>
              </div>

              <div style={{ background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-deep) 100%)', color: 'var(--cream)', borderRadius: 'var(--r-card)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontWeight: 'var(--w-serif-medium)', color: 'var(--cream)', margin: '0' }}>Suggest a speaker</h3>
                <p style={{ fontSize: '14px', color: 'rgba(245, 241, 232, 0.85)', margin: '0' }}>
                  Know someone who should speak at Doubles?
                </p>
                <Link href="/speak" style={{ color: 'var(--ball)', fontWeight: 'var(--w-sans-bold)', textDecoration: 'underline' }}>
                  Nominate them →
                </Link>
              </div>
            </div>
          </div>
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
