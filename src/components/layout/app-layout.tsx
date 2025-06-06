
import React from 'react';
import AppHeader from './app-header';
import BottomNavigation from './bottom-navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-6 pb-20"> {/* Added pb-20 for bottom nav space */}
        {children}
      </main>
      <BottomNavigation />
    </>
  );
}
