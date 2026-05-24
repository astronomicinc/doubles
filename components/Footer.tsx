import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" id="contact" data-screen-label="Footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link href="/" className="nav__logo">
              <span className="nav__logo-dot" aria-hidden="true"></span>
              <span>DOUBLES</span>
            </Link>
            <p className="footer__tag">"Doubles, not solos."</p>
            <div className="footer__socials">
              <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3" y="3" width="18" height="18" rx="5"></rect>
                  <circle cx="12" cy="12" r="4"></circle>
                  <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor"></circle>
                </svg>
              </a>
              <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2H21.5l-7.5 8.57L22.5 22h-6.8l-5.32-6.96L4.5 22H1.24l8.04-9.19L1.5 2h6.97l4.81 6.36L18.24 2zm-1.2 18h1.84L7.05 4H5.1l11.94 16z"></path>
                </svg>
              </a>
              <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"></path>
                </svg>
              </a>
            </div>
          </div>

          <div className="footer__col">
            <h4>Community</h4>
            <ul>
              <li><Link href="/events">What's Next</Link></li>
              <li><Link href="/code-of-conduct">Code of Conduct</Link></li>
              <li><Link href="mailto:hello@doubles.singles">Contact</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4>Learn</h4>
            <ul>
              <li><Link href="/volley">The Volley Format</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/about">Our Story</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4>Legal</h4>
            <ul>
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/press">Press Kit</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copy">
            © {currentYear} Doubles. All rights reserved.
          </p>
          <p className="footer__note">
            Doubles is a curated, quarterly dating event in San Francisco for post-exit founders, investors, and operators.
          </p>
        </div>
      </div>
    </footer>
  );
}
