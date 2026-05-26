/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      // Marketing pages
      // Note: '/' is now handled by app/page.tsx (Phase 2 dynamic migration)
      // Note: '/events' is now handled by app/events/page.tsx (Phase 2A migration)
      { source: '/about', destination: '/about.html' },
      { source: '/apply', destination: '/apply.html' },
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
      // Note: '/application-submitted' is now handled by app/application-submitted/page.tsx (Phase 2A migration)
      { source: '/status', destination: '/status.html' },
      { source: '/friend-invite', destination: '/friend-invite.html' },
      { source: '/accepted', destination: '/accepted.html' },
      { source: '/not-this-volume', destination: '/not-this-volume.html' },
      { source: '/confirmation', destination: '/confirmation.html' },
      { source: '/check-your-email', destination: '/check-your-email.html' },
      { source: '/manage-seat', destination: '/manage-seat.html' },

      // Post-event
      { source: '/post-event/sparks', destination: '/post-event-sparks.html' },
      { source: '/post-event/match', destination: '/post-event-match.html' },
      // Note: '/post-event/no-mutuals' is now handled by app/post-event/no-mutuals/page.tsx (Phase 2A migration)

      // Recap
      // Note: '/recap/[volumeId]' is now handled by app/recap/[volumeId]/page.tsx (Phase 2A migration)

      // Operations/Admin
      { source: '/dispatch', destination: '/dispatch.html' },
      { source: '/door-checkin', destination: '/door-checkin.html' },
      { source: '/email-templates', destination: '/email-templates.html' },

      // Admin dashboard
      // Note: '/admin' is now handled by app/admin/page.tsx (Phase 2A migration)
      // Note: '/admin/volumes' is now handled by app/admin/volumes/page.tsx (Phase 2A migration)
      { source: '/admin/inbox', destination: '/admin-inbox.html' },
      { source: '/admin/application', destination: '/admin-application.html' },
      { source: '/admin/roster', destination: '/admin-roster.html' },
      { source: '/admin/intros', destination: '/admin-intros.html' },
    ];
  },
};

module.exports = nextConfig;
