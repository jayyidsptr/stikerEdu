
'use client';

import { useState } from 'react';
import { useGame } from '@/context/game-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Coins, RefreshCw } from 'lucide-react';
import StickerRevealModal from './sticker-reveal-modal';
import GachaMiniGameModal from './gacha-mini-game-modal'; // Import the new mini-game modal
import type { Sticker } from '@/types';
import { useGameSounds } from '@/hooks/use-game-sounds';

export default function GachaMachine() {
  const { coins, spendCoins, addStickerToCollection, allStickers, gachaCost, lastPulledSticker, setLastPulledSticker } = useGame();
  const { playSound } = useGameSounds();
  const [isProcessingGacha, setIsProcessingGacha] = useState(false); // For initial coin spend and modal opening
  const [isMiniGameModalOpen, setIsMiniGameModalOpen] = useState(false);
  const [isStickerRevealModalOpen, setIsStickerRevealModalOpen] = useState(false);

  const handleInitiateGacha = () => {
    if (isProcessingGacha || coins < gachaCost) {
      if (coins < gachaCost) {
         // Toast is handled by spendCoins in context
      }
      return;
    }

    if (!spendCoins(gachaCost)) {
      return; // Not enough coins, spendCoins handles toast
    }

    setIsProcessingGacha(true);
    playSound('gachaSpin'); // Sound for initiating gacha

    // Open mini-game modal
    setIsMiniGameModalOpen(true);
    setIsProcessingGacha(false); // Reset processing state after opening modal
  };

  const handleMiniGameWin = () => {
    // Mini-game was won, now actually pull the sticker
    const randomIndex = Math.floor(Math.random() * allStickers.length);
    const pulledSticker = allStickers[randomIndex];
    
    addStickerToCollection(pulledSticker); // This will also set lastPulledSticker via context
    
    setIsMiniGameModalOpen(false); // Close mini-game modal
    setIsStickerRevealModalOpen(true); // Open sticker reveal modal
  };

  const handleCloseMiniGameModal = () => {
    setIsMiniGameModalOpen(false);
  };

  const handleCloseStickerRevealModal = () => {
    setIsStickerRevealModalOpen(false);
    setLastPulledSticker(null); // Clear last pulled sticker after modal close
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <CardHeader className="items-center text-center">
        <Gift className="h-20 w-20 text-primary mb-2" />
        <CardTitle className="text-3xl font-headline text-primary">Sticker Gacha</CardTitle>
        <CardDescription className="text-muted-foreground">
          Habiskan {gachaCost} koin untuk bermain dan dapatkan stiker!
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="text-2xl font-semibold text-foreground">
          Koin Kamu: <span className="text-primary">{coins}</span>
        </div>
        <Button
          onClick={handleInitiateGacha}
          disabled={isProcessingGacha || coins < gachaCost || isMiniGameModalOpen}
          size="lg"
          className="w-full py-6 text-xl bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:animate-subtle-bounce"
        >
          {isProcessingGacha ? (
            <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
          ) : (
            <Coins className="mr-2 h-6 w-6" />
          )}
          {isProcessingGacha ? 'Memproses...' : `Main Gacha (${gachaCost} Koin)`}
        </Button>
      </CardContent>
      <CardFooter className="text-center text-xs text-muted-foreground justify-center">
        <p>Semoga beruntung, Cendekiawan!</p>
      </CardFooter>
      
      <GachaMiniGameModal 
        isOpen={isMiniGameModalOpen}
        onClose={handleCloseMiniGameModal}
        onWin={handleMiniGameWin}
      />
      <StickerRevealModal 
        sticker={lastPulledSticker} 
        isOpen={isStickerRevealModalOpen} 
        onClose={handleCloseStickerRevealModal} 
      />
    </Card>
  );
}
