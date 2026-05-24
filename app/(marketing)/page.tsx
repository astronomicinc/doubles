import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Doubles — Good people. Great matches.',
  description:
    'Exclusive dating events for post-exit founders and high-net-worth singles in SF. Bring a friend, meet quality people, make real connections. Vol. 01 launching June 21.',
};

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <header className="hero" data-screen-label="Hero">
        <div className="hero__bg" aria-hidden="true"></div>
        <div className="hero__overlay" aria-hidden="true"></div>
        <div className="hero__court" aria-hidden="true"></div>

        <div className="hero__eyebrow">
          <div className="item">
            <span className="ball"></span> Launching June 21
          </div>
          <div className="item">SF · Founders · Investors</div>
          <div className="item">
            <span className="ball"></span> Building the room
          </div>
        </div>

        <div className="hero__content">
          <h1>
            Good people.<br />
            Great <em>matches</em>.
          </h1>
          <p className="hero__sub">
            An exclusive dating event for post-exit founders, investors, and operators. Bring your sharpest single friend. Meet people who actually get it.
          </p>
          <div className="hero__row">
            <Link href="/apply" className="btn btn--coral">
              Apply for Vol. 01
            </Link>
            <div className="hero__meta">
              <span>June 21 · 6–9 PM · Twin Peaks</span>
            </div>
          </div>
        </div>
      </header>

      {/* Marquee */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          <div className="marquee__item">
            <span className="ball-icon">🎾</span> Vetted · Intentional · Community-driven
          </div>
          <div className="marquee__item">
            <span className="ball-icon">🎾</span> No apps · No algorithms · No flakes
          </div>
          <div className="marquee__item">
            <span className="ball-icon">🎾</span> Vetted · Intentional · Community-driven
          </div>
          <div className="marquee__item">
            <span className="ball-icon">🎾</span> No apps · No algorithms · No flakes
          </div>
        </div>
      </div>

      {/* Format Section */}
      <section className="section" data-screen-label="How It Works">
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">The Format</span>
            <h2>
              How <em>Doubles</em> works
            </h2>
            <p>
              You bring one friend. They bring one friend. We bring two bottles of
              wine and a room full of people who actually listen.
            </p>
          </div>

          <div className="grid grid--3col">
            <div className="card">
              <div className="card__num">1</div>
              <h3>Apply</h3>
              <p>Tell us about yourself. Bring a friend you'd vouch for.</p>
            </div>
            <div className="card">
              <div className="card__num">2</div>
              <h3>We Vet</h3>
              <p>We review applications. Your friend's reputation matters.</p>
            </div>
            <div className="card">
              <div className="card__num">3</div>
              <h3>You Connect</h3>
              <p>Show up. Talk. See who you might actually want to date.</p>
            </div>
          </div>

          <div className="section__footer">
            <Link href="/volley" className="link-with-arrow">
              Learn more about the Volley format <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="section section--dark-bg"
        data-screen-label="CTA"
      >
        <div className="container">
          <div className="cta-block">
            <h2>Ready to meet someone who gets it?</h2>
            <p>
              Vol. 01 is June 21 in Twin Peaks. Bring your best single friend.
            </p>
            <Link href="/apply" className="btn btn--coral btn--lg">
              Apply now <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
