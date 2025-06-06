
'use client';

import { useGame } from '@/context/game-context';
import { Card, CardContent } from '@/components/ui/card';
import { Coins } from 'lucide-react';

export default function UserCoinsDisplay() {
  const { coins } = useGame();

  return (
    <Card className="shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center">
          <Coins className="h-8 w-8 text-primary mr-2" />
          <div className="text-4xl font-bold text-foreground">{coins}</div>
        </div>
        <p className="text-sm text-muted-foreground ml-10">
          Coins
        </p>
      </CardContent>
    </Card>
  );
}
