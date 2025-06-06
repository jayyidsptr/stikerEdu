
export type StickerRarity = 'common' | 'rare' | 'epic';

export interface Sticker {
  id: string;
  name: string;
  imageSrc: string;
  rarity: StickerRarity;
  description: string;
  aiHint: string; // For placeholder image generation
}

// This is the structure returned by the AI flow
export interface TriviaQuestion {
  topic?: string; // Optional: AI flow might not always include topic in output, but component expects it
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface StickerBookMilestone {
  count: number;
  rewardMessage: string;
  achieved: boolean;
  id: string;
}

export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  coins: number;
  collectedStickerIds: string[];
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  uniqueStickerCount: number;
  avatarUrl?: string | null;
  // Add other relevant fields if needed, e.g., title from a predefined list based on rank/score
  title?: string; 
  icon?: React.ReactNode; // For icons like Trophy, ShieldCheck etc.
}
