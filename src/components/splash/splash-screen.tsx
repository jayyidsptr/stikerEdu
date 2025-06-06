
'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500); // Match this duration with layout's splashDuration - 500ms for fade-out

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ease-in-out ${
        isVisible ? 'opacity-100 animate-fade-in' : 'opacity-0 pointer-events-none'
      }`}
    >
      <h1 className="text-6xl font-headline text-primary animate-subtle-bounce">
        EduSticker
      </h1>
      <p className="mt-4 text-lg text-muted-foreground font-body">Memuat...</p>
    </div>
  );
}
