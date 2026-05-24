'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Nav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="nav" data-screen-label="Nav">
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
  );
}
