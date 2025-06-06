'use client';

import Image from 'next/image';
import type { Sticker } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface StickerCardProps {
  sticker: Sticker;
  isCollected: boolean;
}

export default function StickerCard({ sticker, isCollected }: StickerCardProps) {
  const rarityColor = {
    common: 'bg-green-500 hover:bg-green-600',
    rare: 'bg-blue-500 hover:bg-blue-600',
    epic: 'bg-purple-600 hover:bg-purple-700',
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className={cn(
            "overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full",
            !isCollected && "opacity-40 grayscale filter"
          )}>
            <CardHeader className="p-0 relative aspect-square flex items-center justify-center bg-secondary/30">
              <Image
                src={sticker.imageSrc}
                alt={sticker.name}
                width={150}
                height={150}
                className="object-contain p-2"
                data-ai-hint={sticker.aiHint}
              />
            </CardHeader>
            <CardContent className="p-3 flex-grow">
              <CardTitle className="text-md font-semibold truncate" title={sticker.name}>
                {sticker.name}
              </CardTitle>
            </CardContent>
            <CardFooter className="p-3 pt-0">
              <Badge variant="outline" className={cn("text-xs text-white border-none", rarityColor[sticker.rarity])}>
                {sticker.rarity.toUpperCase()}
              </Badge>
            </CardFooter>
          </Card>
        </TooltipTrigger>
        {isCollected && (
          <TooltipContent side="bottom" className="bg-popover text-popover-foreground max-w-xs">
            <p className="font-semibold">{sticker.name}</p>
            <p className="text-sm text-muted-foreground">{sticker.description}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
