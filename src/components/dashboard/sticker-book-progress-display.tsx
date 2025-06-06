'use client';

import { useGame } from '@/context/game-context';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function StickerBookProgressDisplay() {
  const { collectedStickers, allStickers } = useGame();
  const collectedCount = new Set(collectedStickers.map(s => s.id)).size;
  const totalCount = allStickers.length;
  const progressPercentage = totalCount > 0 ? (collectedCount / totalCount) * 100 : 0;

  return (
    <Card className="shadow-md">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm font-medium text-foreground">
            Sticker Collection Progress
          </p>
          <p className="text-sm text-muted-foreground">
            {collectedCount}/{totalCount}
          </p>
        </div>
        <Progress value={progressPercentage} className="h-2 bg-muted [&>div]:bg-primary" aria-label={`${Math.round(progressPercentage)}% collected`} />
      </CardContent>
    </Card>
  );
}
