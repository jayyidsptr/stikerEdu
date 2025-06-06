
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, Skull, HelpCircle, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameSounds } from '@/hooks/use-game-sounds';

const TOTAL_CIRCLES = 6;
const STARS_COUNT = 5;

type ItemType = 'star' | 'skull';

interface GachaMiniGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWin: () => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function GachaMiniGameModal({ isOpen, onClose, onWin }: GachaMiniGameModalProps) {
  const [items, setItems] = useState<ItemType[]>([]);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [starsFound, setStarsFound] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [message, setMessage] = useState('Temukan 5 bintang! Hindari tengkorak.');
  const { playSound } = useGameSounds();

  const initializeGame = useCallback(() => {
    const initialItems: ItemType[] = Array(STARS_COUNT).fill('star').concat(Array(TOTAL_CIRCLES - STARS_COUNT).fill('skull'));
    setItems(shuffleArray(initialItems));
    setRevealed(Array(TOTAL_CIRCLES).fill(false));
    setStarsFound(0);
    setGameState('playing');
    setMessage('Temukan 5 bintang! Hindari tengkorak.');
  }, []);

  useEffect(() => {
    if (isOpen) {
      initializeGame();
    }
  }, [isOpen, initializeGame]);

  const handleCircleClick = (index: number) => {
    if (gameState !== 'playing' || revealed[index]) {
      return;
    }

    playSound('click');
    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);

    const itemClicked = items[index];

    if (itemClicked === 'star') {
      const newStarsFound = starsFound + 1;
      setStarsFound(newStarsFound);
      playSound('correctAnswer');
      if (newStarsFound === STARS_COUNT) {
        setGameState('won');
        setMessage('Selamat! Kamu menemukan semua bintang!');
        playSound('rewardFanfare'); 
      } else {
        setMessage(`Bintang ditemukan! ${STARS_COUNT - newStarsFound} lagi.`);
      }
    } else {
      setGameState('lost');
      setMessage('Oh tidak! Kamu menemukan tengkorak. Coba lagi nanti.');
      playSound('incorrectAnswer');
    }
  };

  const handleCloseModal = () => {
    onClose();
  };

  const handleClaimReward = () => {
    onWin(); // This will trigger sticker pull and open StickerRevealModal in parent
    onClose(); // Close this mini-game modal
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleCloseModal(); }}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground shadow-2xl rounded-xl">
        <DialogHeader className="items-center text-center">
          {gameState === 'won' && <Award className="h-12 w-12 text-primary mb-3" />}
          {gameState === 'lost' && <Skull className="h-12 w-12 text-destructive mb-3" />}
          {gameState === 'playing' && <HelpCircle className="h-12 w-12 text-muted-foreground mb-3" />}
          <DialogTitle className="text-2xl font-headline font-bold text-primary">
            {gameState === 'won' ? 'Kamu Menang!' : gameState === 'lost' ? 'Gagal!' : 'Gacha Mini-Game'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 my-6">
          {items.map((item, index) => (
            <Button
              key={index}
              variant="outline"
              className={cn(
                "h-20 w-full flex items-center justify-center text-4xl rounded-lg shadow-md transform transition-all hover:scale-105",
                revealed[index] && item === 'star' && 'bg-yellow-400/30 border-yellow-500',
                revealed[index] && item === 'skull' && 'bg-red-400/30 border-red-500',
                gameState !== 'playing' && 'cursor-not-allowed',
                !revealed[index] && 'bg-secondary/30 hover:bg-secondary/50'
              )}
              onClick={() => handleCircleClick(index)}
              disabled={gameState !== 'playing' || revealed[index]}
            >
              {revealed[index] ? (
                item === 'star' ? <Star className="h-10 w-10 text-yellow-500" /> : <Skull className="h-10 w-10 text-destructive" />
              ) : (
                <HelpCircle className="h-10 w-10 text-muted-foreground" />
              )}
            </Button>
          ))}
        </div>

        <DialogFooter className="sm:justify-center">
          {gameState === 'won' && (
            <Button onClick={handleClaimReward} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Ambil Stiker!
            </Button>
          )}
          {gameState === 'lost' && (
            <Button onClick={handleCloseModal} variant="destructive">
              Tutup
            </Button>
          )}
          {gameState === 'playing' && (
            <Button onClick={handleCloseModal} variant="outline">
              Batal
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
