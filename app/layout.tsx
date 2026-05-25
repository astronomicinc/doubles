import type { Metadata } from 'next';
import '../styles/design-system.css';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Doubles — Curated Dating Events for Founders & Investors',
  description: 'Exclusive quarterly dating events for post-exit founders, investors, and operators in San Francisco.',
  metadataBase: new URL('https://doubles.singles'),
  openGraph: {
    title: 'Doubles',
    description: 'Exclusive dating events for founders and investors.',
    images: [{ url: '/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Hanken+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
