
'use client';

import GachaMachine from '@/components/gacha/gacha-machine';
import RewardModal from '@/components/book/reward-modal'; 

export default function GachaPage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <GachaMachine />
      <RewardModal />
    </div>
  );
}
