/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      // Marketing pages
      // Note: '/' is now handled by app/page.tsx (Phase 2 dynamic migration)
      { source: '/about', destination: '/about.html' },
      { source: '/apply', destination: '/apply.html' },
      { source: '/events', destination: '/events.html' },
      { source: '/volley', destination: '/volley.html' },
      { source: '/faq', destination: '/faq.html' },
      { source: '/contact', destination: '/contact.html' },
      { source: '/code-of-conduct', destination: '/code-of-conduct.html' },
      { source: '/terms', destination: '/terms.html' },
      { source: '/privacy', destination: '/privacy.html' },
      { source: '/speak', destination: '/speak.html' },
      { source: '/press', destination: '/press.html' },
      { source: '/design-system', destination: '/design-system.html' },

      // Auth/Application flow
      { source: '/status', destination: '/status.html' },
      { source: '/friend-invite', destination: '/friend-invite.html' },
      { source: '/application-submitted', destination: '/application-submitted.html' },
      { source: '/accepted', destination: '/accepted.html' },
      { source: '/not-this-volume', destination: '/not-this-volume.html' },
      { source: '/confirmation', destination: '/confirmation.html' },
      { source: '/check-your-email', destination: '/check-your-email.html' },
      { source: '/manage-seat', destination: '/manage-seat.html' },

      // Post-event
      { source: '/post-event/sparks', destination: '/post-event-sparks.html' },
      { source: '/post-event/match', destination: '/post-event-match.html' },
      { source: '/post-event/no-mutuals', destination: '/post-event-no-mutuals.html' },

      // Recap
      { source: '/recap/vol-01', destination: '/recap-vol-01.html' },

      // Operations/Admin
      { source: '/dispatch', destination: '/dispatch.html' },
      { source: '/door-checkin', destination: '/door-checkin.html' },
      { source: '/email-templates', destination: '/email-templates.html' },

      // Admin dashboard
      { source: '/admin', destination: '/admin-dashboard.html' },
      { source: '/admin/inbox', destination: '/admin-inbox.html' },
      { source: '/admin/application', destination: '/admin-application.html' },
      { source: '/admin/roster', destination: '/admin-roster.html' },
      { source: '/admin/volumes', destination: '/admin-volumes.html' },
      { source: '/admin/intros', destination: '/admin-intros.html' },
    ];
  },
};

module.exports = nextConfig;
