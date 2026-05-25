'use client';

import Link from 'next/link';

export default function ApplyPage() {
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
          <Link href="/apply" className="btn btn--coral btn--sm" aria-current="page">
            Join the list <span className="arrow">→</span>
          </Link>
        </div>
      </nav>

      {/* PAGE HEADER */}
      <header className="page-header">
        <div className="page-header__inner">
          <div>
            <span className="eyebrow"><span className="ball"></span> Step one</span>
            <h1>Tell us about <em>yourself</em></h1>
          </div>
          <p className="page-header__sub">
            We review every application within 48 hours. Yes, we actually read them.
            No bots. No algorithms. Just thoughtful humans making thoughtful decisions.
          </p>
        </div>
      </header>

      {/* APPLICATION FORM SECTION */}
      <section className="apply">
        <div className="container">
          <div className="apply__grid">
            {/* FORM */}
            <form className="apply__form">
              {/* PROGRESS */}
              <div className="steps-progress">
                <div className="steps-progress__item">
                  <div className="steps-progress__num">1</div>
                  <span className="steps-progress__label">Your profile</span>
                </div>
                <div className="steps-progress__divider" aria-hidden="true">•</div>
                <div className="steps-progress__item">
                  <div className="steps-progress__num">2</div>
                  <span className="steps-progress__label">Review &amp; payment</span>
                </div>
              </div>

              {/* FORM FIELDS */}
              <fieldset className="form-section">
                <legend className="form-section__title">Basics</legend>

                <div className="form-group">
                  <label htmlFor="first_name" className="form-label">First name</label>
                  <input type="text" id="first_name" name="first_name" className="form-input" placeholder="Jane" required />
                </div>

                <div className="form-group">
                  <label htmlFor="last_name" className="form-label">Last name</label>
                  <input type="text" id="last_name" name="last_name" className="form-input" placeholder="Doe" required />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input type="email" id="email" name="email" className="form-input" placeholder="jane@example.com" required />
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">Phone (for day-of updates)</label>
                  <input type="tel" id="phone" name="phone" className="form-input" placeholder="+1 (555) 123-4567" required />
                </div>

                <div className="form-group">
                  <label htmlFor="pronouns" className="form-label">Pronouns</label>
                  <input type="text" id="pronouns" name="pronouns" className="form-input" placeholder="she/her" />
                </div>

                <div className="form-group">
                  <label htmlFor="location" className="form-label">Where do you live?</label>
                  <input type="text" id="location" name="location" className="form-input" placeholder="SF, Oakland, Palo Alto..." required />
                </div>
              </fieldset>

              <fieldset className="form-section">
                <legend className="form-section__title">Your story</legend>

                <div className="form-group">
                  <label htmlFor="about" className="form-label">What do you do?</label>
                  <p className="form-hint">What's your main hustle right now? Founder? Investor? Operator? Tell us.</p>
                  <textarea id="about" name="about" className="form-textarea" placeholder="Founder of... / Partner at... / Leading..." rows={3} required></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="why" className="form-label">Why are you interested in Doubles?</label>
                  <p className="form-hint">What brings you here? Are you done with apps? Looking to meet people in your world? Be real with us.</p>
                  <textarea id="why" name="why" className="form-textarea" placeholder="I'm here because..." rows={4} required></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="referring" className="form-label">How did you hear about Doubles?</label>
                  <select id="referring" name="referring" className="form-input" required>
                    <option value="">Select...</option>
                    <option value="friend">Friend referral</option>
                    <option value="twitter">Twitter</option>
                    <option value="instagram">Instagram</option>
                    <option value="article">Article / Press</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </fieldset>

              {/* CTA */}
              <div className="form-actions">
                <button type="submit" className="btn btn--coral">
                  Continue to review <span className="arrow">→</span>
                </button>
                <p className="form-note">You'll review your answers and choose your volume before payment.</p>
              </div>
            </form>

            {/* SIDEBAR */}
            <aside className="apply__sidebar">
              <div className="sidebar-card">
                <span className="eyebrow"><span className="ball"></span> What we're looking for</span>
                <h3>Good judgment</h3>
                <ul className="sidebar-list">
                  <li><span className="ball-dot"></span> You've built or invested in something</li>
                  <li><span className="ball-dot"></span> You're serious about meeting someone</li>
                  <li><span className="ball-dot"></span> You're thoughtful about who you bring</li>
                  <li><span className="ball-dot"></span> You read the code of conduct</li>
                </ul>
              </div>

              <div className="sidebar-card">
                <span className="eyebrow"><span className="ball"></span> What's next</span>
                <h3>The review</h3>
                <p>We read every application. Within 48 hours, you'll hear from us: approved, waitlisted, or try next time.</p>
                <p>If approved, you'll choose a volume and complete payment ($145/person). Simple as that.</p>
              </div>

              <div className="sidebar-card sidebar-card--highlight">
                <h3>Questions?</h3>
                <p>Check out our <Link href="/faq">FAQ</Link> or <Link href="/contact">contact us</Link>.</p>
              </div>
            </aside>
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
                <a href="#" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.07 1.645.07 4.849 0 3.205-.012 3.584-.07 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
                  </svg>
                </a>
                <a href="#" aria-label="Twitter">
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
                <input type="email" placeholder="your@email.com" required aria-label="Email address" />
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
