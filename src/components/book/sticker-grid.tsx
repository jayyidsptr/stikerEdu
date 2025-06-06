'use client';

import { useGame } from '@/context/game-context';
import StickerCard from './sticker-card';

export default function StickerGrid() {
  const { allStickers, isStickerCollected } = useGame();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {allStickers.map((sticker) => (
        <StickerCard key={sticker.id} sticker={sticker} isCollected={isStickerCollected(sticker.id)} />
      ))}
    </div>
  );
}
