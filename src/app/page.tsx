
'use client';

import Link from 'next/link';
import UserCoinsDisplay from '@/components/dashboard/user-coins-display';
import StickerBookProgressDisplay from '@/components/dashboard/sticker-book-progress-display';
import { Button } from '@/components/ui/button';
import RewardModal from '@/components/book/reward-modal';
import { useGame } from '@/context/game-context';
import StickerCard from '@/components/book/sticker-card';

export default function DashboardPage() {
  const { collectedStickers, isStickerCollected } = useGame();

  const recentStickers = [...collectedStickers].reverse().slice(0, 6);

  return (
    <div className="space-y-6">
      <UserCoinsDisplay />
      <StickerBookProgressDisplay />

      <div className="grid grid-cols-2 gap-4 pt-4">
        <Button
          asChild
          size="lg"
          className="py-6 text-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:animate-subtle-bounce"
        >
          <Link href="/gacha">Sticker Gacha!</Link>
        </Button>
        <Button
          asChild
          variant="secondary"
          size="lg"
          className="py-6 text-lg shadow-md hover:animate-subtle-bounce"
        >
          <Link href="/trivia">Dapatkan Koin!</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          asChild
          variant="secondary"
          size="lg"
          className="py-6 text-lg shadow-md hover:animate-subtle-bounce"
        >
          <Link href="/book">Buku Stiker</Link>
        </Button>
        <Button
          asChild
          variant="secondary"
          size="lg"
          className="py-6 text-lg shadow-md hover:animate-subtle-bounce"
        >
          <Link href="/book">Galeri Stiker</Link>
        </Button>
      </div>

      <Button
        asChild
        variant="secondary"
        size="lg"
        className="w-full py-6 text-lg shadow-md hover:animate-subtle-bounce"
      >
        <Link href="/leaderboard">Papan Peringkat</Link>
      </Button>

      {recentStickers.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-2xl font-headline font-bold text-primary text-center">
            Stiker Terbaru Didapat
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
            {recentStickers.map((sticker) => (
              <StickerCard
                key={sticker.id}
                sticker={sticker}
                isCollected={isStickerCollected(sticker.id)}
              />
            ))}
          </div>
        </div>
      )}
      
      <RewardModal />
    </div>
  );
}
