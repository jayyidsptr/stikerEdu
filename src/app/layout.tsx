
import type { Metadata, Viewport } from 'next'; // Added Viewport type
import type { ReactNode } from 'react';
import './globals.css';
import ClientLayoutWrapper from './client-layout-wrapper';

export const metadata: Metadata = {
  title: 'EduSticker',
  description: 'Collect stickers and learn with trivia!',
  manifest: '/manifest.json', // Pastikan path ini benar
};

export const viewport: Viewport = { // Added separate viewport export
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning={true}>
      <head>
        {/* Preconnect and font links are kept here for simplicity,
            though next/font is generally recommended for new projects. */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EduSticker" />
        <link rel="apple-touch-icon" href="/stikerEdu.png" /> {/* Contoh path ikon */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bungee&family=Chakra+Petch:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-background" suppressHydrationWarning={true}>
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
