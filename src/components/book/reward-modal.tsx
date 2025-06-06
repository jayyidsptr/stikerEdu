
'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/context/game-context';
import { useGameSounds } from '@/hooks/use-game-sounds';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Award, PartyPopper } from 'lucide-react';

export default function RewardModal() {
  const { getUnlockedMilestone, markMilestoneAchieved } = useGame();
  const { playSound, isSoundLoaded } = useGameSounds();
  const [isOpen, setIsOpen] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<ReturnType<typeof getUnlockedMilestone>>(null);

  useEffect(() => {
    const milestone = getUnlockedMilestone();
    if (milestone) {
      setCurrentMilestone(milestone);
      setIsOpen(true);
      if (isSoundLoaded && playSound) {
        playSound('rewardFanfare');
      }
    } else {
      setIsOpen(false);
    }
  }, [getUnlockedMilestone, playSound, isSoundLoaded]);

  const handleClose = () => {
    if (currentMilestone) {
      markMilestoneAchieved(currentMilestone.id);
    }
    setIsOpen(false);
    setCurrentMilestone(null);
  };

  if (!currentMilestone) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground shadow-2xl rounded-xl animate-fanfare-scale">
        <DialogHeader className="items-center text-center">
          <Award className="h-16 w-16 text-primary mb-4" />
          <DialogTitle className="text-2xl font-headline font-bold text-primary">Congratulations!</DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground mt-2">
            {currentMilestone.rewardMessage}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center my-6">
          <PartyPopper className="h-12 w-12 text-accent animate-pulse" />
        </div>
        <DialogFooter className="sm:justify-center">
          <Button type="button" onClick={handleClose} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Awesome!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
