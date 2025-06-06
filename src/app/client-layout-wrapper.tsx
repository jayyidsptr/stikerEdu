'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { GameProvider, useGame } from '@/context/game-context';
import AppLayout from '@/components/layout/app-layout';
import SplashScreen from '@/components/splash/splash-screen';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster

function AppInitializer({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAuthLoading } = useGame();
  const router = useRouter();
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(true);
  const splashDuration = 3000; // 3 seconds

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, splashDuration);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showSplash && !isAuthLoading) {
      const authPath = '/auth';
      if (!isAuthenticated && pathname !== authPath) {
        router.replace(authPath);
      } else if (isAuthenticated && pathname === authPath) {
        router.replace('/');
      }
    }
  }, [showSplash, isAuthenticated, isAuthLoading, pathname, router]);

  if (showSplash || isAuthLoading) {
    return <SplashScreen />;
  }

  if (!isAuthenticated && pathname !== '/auth') {
    // Still loading or redirecting, show splash or null to avoid flashing content
    return <SplashScreen />;
  }
  
  if (pathname === '/auth') {
     return <>{children}</>; // Render auth page without AppLayout
  }

  return <AppLayout>{children}</AppLayout>;
}

export default function ClientLayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <GameProvider>
      <AppInitializer>
        {children}
      </AppInitializer>
      <Toaster /> {/* Toaster moved here */}
    </GameProvider>
  );
}
