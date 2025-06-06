
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Trophy, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: `/`, label: "Beranda", icon: Home, exact: true },
    { href: `/book`, label: "Stiker", icon: LayoutGrid },
    { href: `/leaderboard`, label: "Peringkat", icon: Trophy },
    { href: `/profile`, label: "Profil", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-top z-50 h-16">
      <div className="container mx-auto h-full grid grid-cols-4 items-center">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center h-full">
              <item.icon
                className={cn(
                  'h-6 w-6 mb-0.5',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <span
                className={cn(
                  'text-xs',
                  isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
