/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      { source: '/', destination: '/index.html' },
      { source: '/about', destination: '/about.html' },
      { source: '/apply', destination: '/apply.html' },
      { source: '/events', destination: '/events.html' },
      { source: '/volley', destination: '/volley.html' },
      { source: '/faq', destination: '/faq.html' },
      { source: '/contact', destination: '/contact.html' },
      { source: '/code-of-conduct', destination: '/code-of-conduct.html' },
      { source: '/terms', destination: '/terms.html' },
      { source: '/privacy', destination: '/privacy.html' },
      { source: '/status', destination: '/status.html' },
      { source: '/friend-invite', destination: '/friend-invite.html' },
      { source: '/application-submitted', destination: '/application-submitted.html' },
      { source: '/accepted', destination: '/accepted.html' },
      { source: '/not-this-volume', destination: '/not-this-volume.html' },
      { source: '/confirmation', destination: '/confirmation.html' },
      { source: '/design-system', destination: '/design-system.html' },
    ];
  },
};

module.exports = nextConfig;
