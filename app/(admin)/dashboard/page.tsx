'use client';

import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <>
      {/* NAV */}
      <nav className="nav">
        <div className="nav__inner">
          <Link href="/" className="nav__logo" aria-label="Doubles">
            <span className="nav__logo-dot" aria-hidden="true"></span>
            <span>DOUBLES</span>
          </Link>
          <ul className="nav__links">
            <li><Link href="/admin/dashboard" aria-current="page">Dashboard</Link></li>
            <li><Link href="/admin/applications">Applications</Link></li>
            <li><Link href="/admin/volumes">Volumes</Link></li>
            <li><Link href="/admin/roster">Roster</Link></li>
          </ul>
          <Link href="/" className="btn btn--ghost btn--sm">
            Exit admin
          </Link>
        </div>
      </nav>

      {/* PAGE HEADER */}
      <header className="page-header">
        <div className="page-header__inner">
          <div>
            <span className="eyebrow"><span className="ball"></span> Admin Dashboard</span>
            <h1>Manage <em>everything</em></h1>
          </div>
          <p className="page-header__sub">
            Real-time overview of applications, volumes, members, and event logistics.
            All the data you need to run Doubles.
          </p>
        </div>
      </header>

      {/* MAIN DASHBOARD */}
      <section className="section section--cream">
        <div className="container">
          {/* KEY METRICS */}
          <div className="stats" style={{ marginBottom: '80px' }}>
            <div className="stat">
              <div className="stat__num">12</div>
              <div className="stat__label">Pending applications</div>
            </div>
            <div className="stat">
              <div className="stat__num">28</div>
              <div className="stat__label">Approved for Vol. 01</div>
            </div>
            <div className="stat">
              <div className="stat__num">6</div>
              <div className="stat__label">Waitlisted</div>
            </div>
            <div className="stat">
              <div className="stat__num">2</div>
              <div className="stat__label">Rejected</div>
            </div>
          </div>

          {/* TWO-COLUMN LAYOUT */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '60px', alignItems: 'start' }}>
            {/* MAIN CONTENT */}
            <div>
              {/* VOLUME OVERVIEW */}
              <div style={{ marginBottom: '60px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                  <h2 className="t-h3">Vol. 01 — Founding Launch</h2>
                  <Link href="/admin/volumes/vol-01" className="btn btn--coral btn--sm">
                    Manage
                  </Link>
                </div>

                <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 'var(--r-card)', padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 'var(--w-sans-bold)', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: '12px' }}>Date</div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 'var(--w-serif-medium)', color: 'var(--ink)' }}>June 21, 2024</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 'var(--w-sans-bold)', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: '12px' }}>Capacity</div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 'var(--w-serif-medium)', color: 'var(--ink)' }}>28 / 30</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 'var(--w-sans-bold)', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: '12px' }}>Revenue</div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 'var(--w-serif-medium)', color: 'var(--teal)' }}>$4,060</div>
                  </div>
                </div>
              </div>

              {/* RECENT APPLICATIONS */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                  <h2 className="t-h3">Recent applications</h2>
                  <Link href="/admin/applications" className="btn btn--ghost btn--sm">
                    View all →
                  </Link>
                </div>

                <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 'var(--r-card)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--cream)' }}>
                        <th style={{ padding: '18px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 'var(--w-sans-bold)', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>Name</th>
                        <th style={{ padding: '18px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 'var(--w-sans-bold)', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>Status</th>
                        <th style={{ padding: '18px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 'var(--w-sans-bold)', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>Applied</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['Jane Doe', 'John Smith', 'Sarah Chen'].map((name, i) => (
                        <tr key={i} style={{ borderBottom: i < 2 ? '1px solid var(--line)' : 'none' }}>
                          <td style={{ padding: '18px 24px', fontSize: '14px', color: 'var(--ink)' }}>
                            <Link href="#" style={{ color: 'var(--teal)', fontWeight: 'var(--w-sans-bold)' }}>
                              {name}
                            </Link>
                          </td>
                          <td style={{ padding: '18px 24px', fontSize: '12px' }}>
                            <span style={{ background: 'var(--ball)', color: 'var(--ink)', padding: '6px 12px', borderRadius: 'var(--r-pill)', fontSize: '10px', fontWeight: 'var(--w-sans-bold)', letterSpacing: '0.16em', textTransform: 'uppercase', display: 'inline-block' }}>
                              Pending
                            </span>
                          </td>
                          <td style={{ padding: '18px 24px', fontSize: '14px', color: 'var(--ink-soft)' }}>2 hours ago</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* SIDEBAR */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 'var(--r-card)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 'var(--w-serif-medium)', color: 'var(--ink)', margin: '0' }}>Quick actions</h3>
                <Link href="/admin/applications" style={{ display: 'block', padding: '12px 16px', background: 'var(--teal)', color: 'var(--cream)', borderRadius: 'var(--r-pill)', fontSize: '13px', fontWeight: 'var(--w-sans-bold)', letterSpacing: '0.16em', textTransform: 'uppercase', textAlign: 'center', marginBottom: '8px' }}>
                  Review pending
                </Link>
                <Link href="/admin/volumes" style={{ display: 'block', padding: '12px 16px', background: 'transparent', color: 'var(--teal)', border: '1px solid var(--line)', borderRadius: 'var(--r-pill)', fontSize: '13px', fontWeight: 'var(--w-sans-bold)', letterSpacing: '0.16em', textTransform: 'uppercase', textAlign: 'center' }}>
                  Create new volume
                </Link>
              </div>

              <div style={{ background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-deep) 100%)', color: 'var(--cream)', borderRadius: 'var(--r-card)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 'var(--w-serif-medium)', color: 'var(--cream)', margin: '0' }}>Event checklist</h3>
                <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'rgba(245, 241, 232, 0.85)' }}>
                  <div style={{ marginBottom: '12px' }}>✓ Catering confirmed</div>
                  <div style={{ marginBottom: '12px' }}>✓ Venue setup scheduled</div>
                  <div style={{ marginBottom: '12px' }}>○ Photographer assigned</div>
                  <div>○ Email reminders sent</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
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
