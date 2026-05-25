'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      {/* NAV */}
      <nav className="nav">
        <div className="nav__inner">
          <Link href="/" className="nav__logo" aria-label="Doubles">
            <span className="nav__logo-dot" aria-hidden="true"></span>
            <span>DOUBLES</span>
          </Link>
          <ul className="nav__links" id="primary-nav">
            <li><Link href="/events">Events</Link></li>
            <li><Link href="/apply">Apply</Link></li>
            <li><Link href="/volley">Volley</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
          <Link href="/apply" className="btn btn--coral btn--sm">
            Join the list <span className="arrow">→</span>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <div className="hero__bg" aria-hidden="true"></div>
        <div className="hero__overlay" aria-hidden="true"></div>
        <div className="hero__court" aria-hidden="true"></div>

        <div className="hero__eyebrow">
          <div className="item"><span className="ball"></span> Launching June 21</div>
          <div className="item">SF · Founders · Investors</div>
          <div className="item">Vol. 01 / Founding Launch</div>
        </div>

        <div className="hero__content">
          <h1 className="t-display">Good people.<br/>Great <em>matches</em>.</h1>
          <p className="hero__sub t-lead">
            We're launching the dating event we always wished existed. Exclusive evenings
            for experienced SF founders and investors who are tired of apps and algorithms.
            Bring a friend, meet quality people, and make real connections. Thirty fascinating
            humans in one extraordinary room.
          </p>
          <div className="hero__row">
            <Link href="/apply" className="btn btn--coral">
              Apply for next event <span className="arrow">→</span>
            </Link>
            <div className="hero__meta">Next volume · Saturday, June 21</div>
          </div>
        </div>
      </header>

      {/* MARQUEE */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          <div className="marquee__item"><span className="dot"></span> Founding Launch — Vol. 01</div>
          <div className="marquee__item"><span className="dot"></span> Twin Peaks · June 21</div>
          <div className="marquee__item"><span className="dot"></span> 30 Singles · Catered · Curated</div>
          <div className="marquee__item"><span className="dot"></span> Bring a friend. Meet a match.</div>
          <div className="marquee__item"><span className="dot"></span> Be part of the founding community.</div>
          <div className="marquee__item"><span className="dot"></span> Founding Launch — Vol. 01</div>
          <div className="marquee__item"><span className="dot"></span> Twin Peaks · June 21</div>
          <div className="marquee__item"><span className="dot"></span> 30 Singles · Catered · Curated</div>
          <div className="marquee__item"><span className="dot"></span> Bring a friend. Meet a match.</div>
          <div className="marquee__item"><span className="dot"></span> Be part of the founding community.</div>
        </div>
      </div>

      {/* NEXT EVENT */}
      <section className="section section--cream" id="events">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow"><span className="ball"></span> The founding volume</span>
              <h2 className="t-h2">Vol. 01 — <em>Founding Launch</em></h2>
            </div>
            <p className="lead">
              Our inaugural event. Thirty carefully curated founders and investors,
              brought together by people who vouch for them. This is how we start —
              this is the founding volume.
            </p>
          </div>

          <article className="event-card">
            <div className="event-card__photo" role="img" aria-label="Twin Peaks penthouse">
              <span className="event-tag"><span className="pulse"></span> Applications open</span>
            </div>
            <div className="event-card__body">
              <span className="eyebrow">Our first Doubles event</span>
              <h2>An evening <em>worth showing up for</em>.</h2>

              <dl className="event-meta">
                <dt>Date</dt>     <dd>Saturday, June 21</dd>
                <dt>Time</dt>     <dd>6:00 — 9:00 PM</dd>
                <dt>Location</dt> <dd>Twin Peaks House, SF</dd>
                <dt>Dress</dt>    <dd>Smart casual, no sneakers</dd>
              </dl>

              <ul className="event-features">
                <li><span className="ball-dot"></span> 30 hand-picked singles</li>
                <li><span className="ball-dot"></span> Catered bites &amp; cocktails</li>
                <li><span className="ball-dot"></span> Upbeat jazz, golden-hour light</li>
                <li><span className="ball-dot"></span> Real conversation, no name tags</li>
              </ul>

              <div className="event-actions">
                <Link href="/apply" className="btn btn--coral">
                  Reserve your spot <span className="arrow">→</span>
                </Link>
                <span className="note">12 of 30 seats remain</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section section--teal court-grid">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow"><span className="ball"></span> Four steps to connection</span>
              <h2 className="t-h2">How Doubles <em>works</em></h2>
            </div>
            <p className="lead">
              Built on trust, not algorithms. Every attendee is vouched for by someone
              who knows them. Simple, intentional, and designed for real connection.
            </p>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step__num"><span>Step 01</span></div>
              <div className="step__badge">1</div>
              <h3>Apply</h3>
              <p>Tell us about yourself. We care about who you are, what matters to you, and why you're here.</p>
            </div>

            <div className="step">
              <div className="step__num"><span>Step 02</span></div>
              <div className="step__badge">2</div>
              <h3>We review</h3>
              <p>We're selective. Not because we're snobby, but because everyone deserves a quality room.</p>
            </div>

            <div className="step">
              <div className="step__num"><span>Step 03</span></div>
              <div className="step__badge">3</div>
              <h3>Bring a friend</h3>
              <p>Bring someone single you'd vouch for. Their presence is your recommendation.</p>
            </div>

            <div className="step">
              <div className="step__num"><span>Step 04</span></div>
              <div className="step__badge">4</div>
              <h3>Show up &amp; connect</h3>
              <p>One evening. Thirty fascinating people. Real conversation. No pressure, just possibility.</p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="section section--cream">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow"><span className="ball"></span> By the numbers</span>
              <h2 className="t-h2">What makes Doubles <em>different</em></h2>
            </div>
            <p className="lead">
              Not a dating app. Not a networking event. A community built on trust,
              intention, and the belief that great connections happen in real rooms.
            </p>
          </div>

          <div className="stats">
            <div className="stat">
              <div className="stat__num">30<sup>×</sup></div>
              <div className="stat__label">Singles per event</div>
            </div>
            <div className="stat">
              <div className="stat__num">∞</div>
              <div className="stat__label">Real conversations</div>
            </div>
            <div className="stat">
              <div className="stat__num">0</div>
              <div className="stat__label">Swiping required</div>
            </div>
            <div className="stat">
              <div className="stat__num">1</div>
              <div className="stat__label">Rule: Show up</div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="final-cta__inner">
          <h2>Ready to <em>connect</em>?</h2>
          <p>
            Applications for Vol. 01 close May 31. Spots are limited. If you want in,
            apply now and tell us why you're ready for something different.
          </p>
          <div className="final-cta__actions">
            <Link href="/apply" className="btn btn--coral">
              Apply now <span className="arrow">→</span>
            </Link>
            <span className="approve">• Curated • Intentional • Worth it</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer__grid">
            <div className="footer__brand">
              <Link href="/" className="nav__logo" aria-label="Doubles">
                <span className="nav__logo-dot" aria-hidden="true"></span>
                <span>DOUBLES</span>
              </Link>
              <p className="footer__tag">Strategy. Partnership. Connection.</p>
              <div className="footer__socials">
                <a href="#" aria-label="Instagram" title="Instagram">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.07 1.645.07 4.849 0 3.205-.012 3.584-.07 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
                  </svg>
                </a>
                <a href="#" aria-label="Twitter" title="Twitter">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7z" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="footer__col">
              <h4>Discover</h4>
              <ul>
                <li><Link href="/events">Events</Link></li>
                <li><Link href="/apply">Apply</Link></li>
                <li><Link href="/volley">Volley</Link></li>
                <li><Link href="/about">About</Link></li>
              </ul>
            </div>

            <div className="footer__col">
              <h4>Learn</h4>
              <ul>
                <li><Link href="/faq">FAQ</Link></li>
                <li><Link href="/code-of-conduct">Code of Conduct</Link></li>
                <li><Link href="/press">Press</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>

            <div className="footer__newsletter">
              <h4>Updates</h4>
              <p>Get event announcements and speaker invitations.</p>
              <form onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  required
                  aria-label="Email address"
                />
                <button type="submit">Subscribe</button>
              </form>
            </div>
          </div>

          <div className="footer__bottom">
            <div className="tag">
              <span className="ball"></span>
              <span>© 2024 Doubles, Inc.</span>
            </div>
            <div className="tag">
              <Link href="/terms">Terms</Link>
              <Link href="/privacy">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
