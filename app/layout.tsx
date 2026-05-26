import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Doubles — Good people. Great matches.',
  description: 'Exclusive dating events for post-exit founders and high-net-worth singles in SF. Bring a friend, meet quality people, make real connections. Vol. 01 launching June 21.',
  metadataBase: new URL('https://doubles.singles'),
  openGraph: {
    title: 'Doubles — Good people. Great matches.',
    description: 'Exclusive dating events for post-exit founders and high-net-worth singles in SF.',
    url: 'https://doubles.singles',
    type: 'website',
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
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Hanken+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Global CSS */}
        <link rel="stylesheet" href="/assets/doubles.css" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
