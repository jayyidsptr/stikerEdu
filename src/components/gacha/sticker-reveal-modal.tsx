
'use client';

import Image from 'next/image';
import type { Sticker } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StickerRevealModalProps {
  sticker: Sticker | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function StickerRevealModal({ sticker, isOpen, onClose }: StickerRevealModalProps) {
  if (!sticker) return null;

  const rarityColor = {
    common: 'bg-green-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-600',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm bg-card text-card-foreground shadow-2xl rounded-xl">
        <DialogHeader className="items-center text-center">
          <Sparkles className="h-12 w-12 text-primary mb-3" />
          <DialogTitle className="text-2xl font-headline font-bold text-primary">You got a new sticker!</DialogTitle>
        </DialogHeader>
        
        <div className="my-6 flex flex-col items-center gap-4 animate-spin-and-reveal">
          <div className="p-4 bg-secondary/30 rounded-lg shadow-inner animate-glowing-border">
            <Image
              src={sticker.imageSrc}
              alt={sticker.name}
              width={180}
              height={180}
              className="object-contain"
              data-ai-hint={sticker.aiHint}
            />
          </div>
          <h3 className="text-xl font-semibold text-foreground">{sticker.name}</h3>
          <Badge variant="outline" className={cn("text-sm text-white border-none px-3 py-1", rarityColor[sticker.rarity])}>
            {sticker.rarity.toUpperCase()}
          </Badge>
          <DialogDescription className="text-center text-muted-foreground px-4">
            {sticker.description}
          </DialogDescription>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button type="button" onClick={onClose} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Collect!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
