
'use client';

import StickerGrid from '@/components/book/sticker-grid';
import RewardModal from '@/components/book/reward-modal';

export default function StickerBookPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold text-primary mb-2">Buku Stiker Kamu</h1>
        <p className="text-lg text-muted-foreground">
          Lihat koleksi stiker menakjubkanmu!
        </p>
      </div>
      <StickerGrid />
      <RewardModal />
    </div>
  );
}
