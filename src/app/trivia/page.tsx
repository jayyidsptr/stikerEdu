
'use client';

import TriviaGame from '@/components/trivia/trivia-game';
import RewardModal from '@/components/book/reward-modal';

export default function TriviaPage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <TriviaGame />
      <RewardModal />
    </div>
  );
}
