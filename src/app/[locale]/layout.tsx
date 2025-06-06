
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import '../globals.css'; // Adjusted path for [locale] structure
import { Toaster } from '@/components/ui/toaster';
import { GameProvider, useGame } from '@/context/game-context';
import AppLayout from '@/components/layout/app-layout';
import type { Locale } from '@/config/i18n.config';
import { I18nClientProvider } from '@/context/i18n-client-context'; 
import SplashScreen from '@/components/splash/splash-screen';


interface RootLayoutProps {
  children: ReactNode;
  params: { locale: Locale };
}

function AppInitializer({ children, locale }: { children: ReactNode; locale: Locale }) {
  const { isAuthenticated, isAuthLoading } = useGame();
  const router = useRouter();
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(true);
  const splashDuration = 3000; 

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, splashDuration);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showSplash && !isAuthLoading) {
      const authPath = `/${locale}/auth`;
      if (!isAuthenticated && pathname !== authPath) {
        router.replace(authPath);
      } else if (isAuthenticated && pathname === authPath) {
        router.replace(`/${locale}`);
      }
    }
  }, [showSplash, isAuthenticated, isAuthLoading, pathname, router, locale]);

  if (showSplash || isAuthLoading) {
    return <SplashScreen />; // Removed locale prop as it's not used in SplashScreen
  }

  if (!isAuthenticated && pathname !== `/${locale}/auth`) {
    return <SplashScreen />; // Removed locale prop
  }
  
  if (pathname === `/${locale}/auth`) {
     return <>{children}</>; 
  }

  return <AppLayout locale={locale}>{children}</AppLayout>;
}

export default function RootLayout({ children, params: { locale } }: RootLayoutProps) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => console.log('Service Worker registered with scope:', registration.scope))
          .catch(err => console.error('Service Worker registration failed:', err));
      });
    }
  }, []);

  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F27E26" />
        <link rel="apple-touch-icon" href="https://placehold.co/180x180.png" data-ai-hint="app logo" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EduSticker" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bungee&family=Chakra+Petch:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-background">
        <I18nClientProvider locale={locale}>
          <GameProvider>
            <AppInitializer locale={locale}>
              {children}
            </AppInitializer>
            <Toaster />
          </GameProvider>
        </I18nClientProvider>
      </body>
    </html>
  );
}
