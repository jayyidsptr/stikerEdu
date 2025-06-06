
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { auth, db } from '@/lib/firebase/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import type { Sticker, StickerBookMilestone, TriviaQuestion as GenerateTriviaQuestionOutput, UserProfileData, LeaderboardEntry } from '@/types';
import { ALL_STICKERS_DATA, STICKER_BOOK_MILESTONES_DATA, INITIAL_COINS as DEFAULT_INITIAL_COINS, GACHA_COST } from '@/data/stickers';
import { useToast } from '@/hooks/use-toast';
import { useGameSounds } from '@/hooks/use-game-sounds';
import { generateTriviaQuestion } from '@/ai/flows/generate-trivia-question';
import { Award, ShieldCheck, Star, Trophy, XCircle } from 'lucide-react';

const TRIVIA_QUESTIONS_PER_SESSION = 10;
const INITIAL_TRIVIA_LIVES = 3;
const COINS_PER_CORRECT_ANSWER_TRIVIA = 5;

interface GameState {
  currentUser: FirebaseUser | null;
  userProfileData: UserProfileData | null;
  coins: number;
  collectedStickers: Sticker[];
  allStickers: Sticker[];
  stickerBookMilestones: StickerBookMilestone[];
  gachaCost: number;
  lastPulledSticker: Sticker | null;
  lastRewardMessage: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isFetchingTrivia: boolean;
  isSavingData: boolean; 
  triviaLives: number;
  triviaSessionActive: boolean;
  triviaCurrentQuestionIndex: number;
  triviaSessionQuestions: GenerateTriviaQuestionOutput[];
  triviaCooldownEnd: number | null;
}

interface GameContextType extends GameState {
  registerUser: (email: string, pass: string, displayName?: string) => Promise<void>;
  loginUser: (email: string, pass: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  updateUserProfileName: (newName: string) => Promise<void>;
  addCoins: (amount: number) => Promise<void>;
  spendCoins: (amount: number) => Promise<boolean>;
  addStickerToCollection: (sticker: Sticker) => Promise<void>;
  isStickerCollected: (stickerId: string) => boolean;
  setLastPulledSticker: (sticker: Sticker | null) => void;
  clearLastRewardMessage: () => void;
  getUnlockedMilestone: () => StickerBookMilestone | null;
  markMilestoneAchieved: (milestoneId: string) => void;
  startTriviaSession: () => Promise<void>;
  submitTriviaAnswer: (selectedIndex: number) => { correct: boolean; correctAnswerText: string; gameOver: boolean };
  proceedToNextQuestion: () => { sessionComplete: boolean };
  isTriviaLocked: () => boolean;
  getRemainingLockoutTime: () => string | null;
  getTriviaQuestionCount: () => number;
  getLeaderboardData: () => Promise<LeaderboardEntry[]>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const TRIVIA_TOPICS_CONTEXT = [
  'Bahasa Indonesia', 'Sejarah Indonesia', 'Matematika Dasar', 
  'Ilmu Pengetahuan Sosial (IPS)', 'Ilmu Pengetahuan Alam (IPA)', 
  'Geografi Indonesia', 'Budaya Indonesia', 'Pengetahuan Umum Dunia'
];

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfileData, setUserProfileData] = useState<UserProfileData | null>(null);
  const [coins, setCoins] = useState(DEFAULT_INITIAL_COINS);
  const [collectedStickers, setCollectedStickers] = useState<Sticker[]>([]);
  const [allStickers] = useState<Sticker[]>(ALL_STICKERS_DATA);
  const [stickerBookMilestones, setStickerBookMilestones] = useState<StickerBookMilestone[]>(STICKER_BOOK_MILESTONES_DATA);
  const [gachaCost] = useState(GACHA_COST);
  const [lastPulledSticker, setLastPulledSticker] = useState<Sticker | null>(null);
  const [lastRewardMessage, setLastRewardMessage] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isFetchingTrivia, setIsFetchingTrivia] = useState(false);
  const [isSavingData, setIsSavingData] = useState(false);

  const [triviaLives, setTriviaLives] = useState(INITIAL_TRIVIA_LIVES);
  const [triviaSessionActive, setTriviaSessionActive] = useState(false);
  const [triviaCurrentQuestionIndex, setTriviaCurrentQuestionIndex] = useState(0);
  const [triviaSessionQuestions, setTriviaSessionQuestions] = useState<GenerateTriviaQuestionOutput[]>([]);
  const [triviaCooldownEnd, setTriviaCooldownEnd] = useState<number | null>(null);

  const { toast } = useToast();
  const { playSound } = useGameSounds();

  const loadUserData = useCallback(async (user: FirebaseUser) => {
    setIsAuthLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      let userDataFromDb: Partial<UserProfileData> = {};

      if (userDocSnap.exists()) {
        userDataFromDb = userDocSnap.data() as UserProfileData;
        setCoins(userDataFromDb.coins ?? DEFAULT_INITIAL_COINS);
        const stickerIds = userDataFromDb.collectedStickerIds ?? [];
        const userCollectedStickers = stickerIds.map((id: string) => allStickers.find(s => s.id === id)).filter(Boolean) as Sticker[];
        setCollectedStickers(userCollectedStickers);
        const achievedMilestoneIds = userDataFromDb.achievedMilestoneIds || [];
        setStickerBookMilestones(STICKER_BOOK_MILESTONES_DATA.map(m => ({
          ...m,
          achieved: achievedMilestoneIds.includes(m.id)
        })));

      } else {
        const initialData: UserProfileData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName, 
          photoURL: user.photoURL,
          coins: DEFAULT_INITIAL_COINS,
          collectedStickerIds: [],
          achievedMilestoneIds: [],
        };
        await setDoc(userDocRef, initialData);
        userDataFromDb = initialData;
        setCoins(DEFAULT_INITIAL_COINS);
        setCollectedStickers([]);
        setStickerBookMilestones(STICKER_BOOK_MILESTONES_DATA.map(m => ({...m, achieved: false})));
      }
      
      const combinedProfile: UserProfileData = {
        uid: user.uid,
        email: user.email, 
        displayName: user.displayName || userDataFromDb.displayName || null, 
        photoURL: user.photoURL || userDataFromDb.photoURL || null,
        coins: userDataFromDb.coins ?? DEFAULT_INITIAL_COINS,
        collectedStickerIds: userDataFromDb.collectedStickerIds ?? [],
        achievedMilestoneIds: userDataFromDb.achievedMilestoneIds ?? [],
      };
      setUserProfileData(combinedProfile);

    } catch (error) {
      console.error("Error loading user data:", error);
      toast({ title: "Gagal Memuat Data", description: "Tidak dapat memuat data pengguna.", variant: "destructive" });
      setUserProfileData({
        uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL,
        coins: DEFAULT_INITIAL_COINS, collectedStickerIds: [], achievedMilestoneIds: []
      });
      setCoins(DEFAULT_INITIAL_COINS);
      setCollectedStickers([]);
      setStickerBookMilestones(STICKER_BOOK_MILESTONES_DATA.map(m => ({...m, achieved: false})));
    } finally {
      setIsAuthLoading(false);
    }
  }, [allStickers, toast]);
  
  const resetLocalGameState = useCallback(() => {
    setCurrentUser(null);
    setUserProfileData(null);
    setCoins(DEFAULT_INITIAL_COINS);
    setCollectedStickers([]);
    setLastPulledSticker(null);
    setLastRewardMessage(null);
    setTriviaSessionActive(false);
    setStickerBookMilestones(STICKER_BOOK_MILESTONES_DATA.map(m => ({...m, achieved: false})));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user); 
        setIsAuthenticated(true);
        await loadUserData(user); 
      } else {
        resetLocalGameState();
        setIsAuthenticated(false);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, [loadUserData, resetLocalGameState]);
  
  const saveUserData = useCallback(async (dataToPersist: Partial<UserProfileData>) => {
    if (!currentUser) {
        // console.warn("saveUserData called without currentUser. This might be expected during logout or initial load.");
        return;
    }
    // isSavingData check is handled by the caller (useEffect) or specific update functions
    
    setIsSavingData(true);
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      // uid should not be part of the data written to Firestore document fields
      const { uid, ...saveableData } = dataToPersist as Omit<UserProfileData, 'uid'> & { uid?: string };
      
      await setDoc(userDocRef, saveableData , { merge: true });
    } catch (error) {
      console.error("Error saving user data:", error);
      toast({ title: "Gagal Menyimpan Data", description: "Perubahan mungkin tidak tersimpan.", variant: "destructive" });
    } finally {
      setIsSavingData(false);
    }
  }, [currentUser, toast]);


  useEffect(() => {
    // This effect auto-saves game progress like coins, stickers, milestones
    if (currentUser && !isAuthLoading && !isSavingData && userProfileData) {
      const gameProgressData: Partial<UserProfileData> = {
        coins: coins,
        collectedStickerIds: collectedStickers.map(s => s.id),
        achievedMilestoneIds: stickerBookMilestones.filter(m => m.achieved).map(m => m.id),
      };
      saveUserData(gameProgressData);
    }
  }, [
    coins, 
    collectedStickers, 
    stickerBookMilestones, 
    currentUser,        // Condition: user must be logged in
    isAuthLoading,      // Condition: auth must not be loading
    userProfileData,    // Condition: profile data must be loaded
    saveUserData        // The save function (memoized)
    // isSavingData is NOT in this dependency array to prevent re-triggering from its own setIsSavingData(false)
  ]);


  const registerUser = async (email: string, pass: string, displayName?: string) => {
    setIsAuthLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      // loadUserData will be called by onAuthStateChanged
      toast({ title: "Registrasi Berhasil", description: "Selamat datang!" });
    } catch (error: any) {
      console.error("Error registering:", error);
      toast({ title: "Registrasi Gagal", description: error.message, variant: "destructive" });
      throw error; 
    } 
  };

  const loginUser = async (email: string, pass: string) => {
    setIsAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // loadUserData will be called by onAuthStateChanged
      toast({ title: "Login Berhasil", description: "Selamat datang kembali!" });
    } catch (error: any) {
      console.error("Error logging in:", error);
      // Don't toast here, let AuthForm handle UI feedback for login failure
      throw error; 
    }
  };

  const logoutUser = async () => {
    setIsAuthLoading(true);
    try {
      await firebaseSignOut(auth);
      toast({ title: "Logout Berhasil", description: "Anda telah keluar." });
    } catch (error: any) {
      console.error("Error logging out:", error);
      toast({ title: "Logout Gagal", description: error.message, variant: "destructive" });
    } finally {
      // State reset will be handled by onAuthStateChanged
      // setIsAuthLoading(false); // onAuthStateChanged will set this
    }
  };

  const updateUserProfileName = async (newName: string) => {
    if (!currentUser) {
      toast({ title: "Error", description: "Pengguna tidak login.", variant: "destructive" });
      return;
    }
    if (isSavingData) {
        toast({ title: "Harap Tunggu", description: "Proses penyimpanan sebelumnya masih berjalan.", variant: "default" });
        return;
    }
    setIsSavingData(true);
    try {
      await updateProfile(currentUser, { displayName: newName });
      
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, { displayName: newName });

      // Optimistically update local state for immediate UI feedback
      setCurrentUser(prevUser => prevUser ? { ...prevUser, displayName: newName } as FirebaseUser : null);
      setUserProfileData(prevData => prevData ? { ...prevData, displayName: newName } : null);
      
      toast({ title: "Profil Diperbarui", description: "Nama Anda telah berhasil diubah." });
    } catch (error: any) {
      console.error("Error updating profile name:", error);
      toast({ title: "Gagal Memperbarui Nama", description: error.message, variant: "destructive" });
    } finally {
      setIsSavingData(false);
    }
  };
  
  useEffect(() => {
    if (userProfileData?.uid) { 
      const storedCooldownEnd = localStorage.getItem(`triviaCooldownEnd_${userProfileData.uid}`);
      if (storedCooldownEnd) {
        const cooldownTime = parseInt(storedCooldownEnd, 10);
        if (Date.now() < cooldownTime) {
          setTriviaCooldownEnd(cooldownTime);
        } else {
          localStorage.removeItem(`triviaCooldownEnd_${userProfileData.uid}`);
        }
      }
    }
  }, [userProfileData?.uid]); 

  const addCoins = useCallback(async (amount: number) => {
    setCoins(prevCoins => prevCoins + amount);
  }, []);

  const spendCoins = useCallback(async (amount: number) => {
    if (coins >= amount) {
      setCoins(prevCoins => prevCoins - amount);
      return true;
    }
    toast({ title: "Koin tidak cukup!", description: `Kamu butuh ${amount} koin.`, variant: 'destructive' });
    return false;
  }, [coins, toast]);
  
  const isStickerCollected = useCallback((stickerId: string) => {
    return collectedStickers.some(s => s.id === stickerId);
  }, [collectedStickers]);

  const checkAndTriggerRewards = useCallback(() => {
    const uniqueCollectedCount = new Set(collectedStickers.map(s => s.id)).size;
    const newlyAchievedMilestones = stickerBookMilestones.filter(
      milestone => !milestone.achieved && uniqueCollectedCount >= milestone.count
    );

    if (newlyAchievedMilestones.length > 0) {
      const highestNewMilestone = newlyAchievedMilestones.sort((a,b) => b.count - a.count)[0];
      setLastRewardMessage(highestNewMilestone.rewardMessage);
      // Milestone 'achieved' status is updated via markMilestoneAchieved, which then triggers auto-save
    }
  }, [collectedStickers, stickerBookMilestones]);

  const addStickerToCollection = useCallback(async (sticker: Sticker) => {
    if (!isStickerCollected(sticker.id)) {
      setCollectedStickers(prevStickers => {
        const newStickers = [...prevStickers, sticker];
        // Call checkAndTriggerRewards after state update, but it's better to do it in useEffect based on collectedStickers
        return newStickers;
      });
    }
    setLastPulledSticker(sticker);
    playSound('stickerReveal');
    // checkAndTriggerRewards will be called by useEffect watching collectedStickers
  }, [isStickerCollected, playSound]);

  // useEffect to check rewards when collectedStickers changes
  useEffect(() => {
    checkAndTriggerRewards();
  }, [collectedStickers, checkAndTriggerRewards]);


  const clearLastRewardMessage = () => {
    setLastRewardMessage(null);
  };

  const getUnlockedMilestone = (): StickerBookMilestone | null => {
    if (!lastRewardMessage) return null; // Ensure there's a message to find a milestone for
    // Find the first unachieved milestone that matches the reward message
    return stickerBookMilestones.find(m => m.rewardMessage === lastRewardMessage && !m.achieved) || null;
  };

  const markMilestoneAchieved = (milestoneId: string) => {
    setStickerBookMilestones(prevMilestones =>
      prevMilestones.map(m =>
        m.id === milestoneId ? { ...m, achieved: true } : m
      )
    );
    // Auto-save will pick this up due to stickerBookMilestones changing
    clearLastRewardMessage(); // Clear the message so modal doesn't re-appear unnecessarily
  };

  const isTriviaLocked = useCallback(() => {
    return triviaCooldownEnd !== null && Date.now() < triviaCooldownEnd;
  }, [triviaCooldownEnd]);

  const getRemainingLockoutTime = useCallback((): string | null => {
    if (!triviaCooldownEnd || Date.now() >= triviaCooldownEnd) {
      if (triviaCooldownEnd && Date.now() >= triviaCooldownEnd) {
        // Cooldown has ended
        setTriviaCooldownEnd(null); // Clear the state
        if (userProfileData?.uid) {
          localStorage.removeItem(`triviaCooldownEnd_${userProfileData.uid}`); // Clear from localStorage
        }
      }
      return null;
    }
    const ms = triviaCooldownEnd - Date.now();
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}j ${minutes}m ${seconds}d`;
  }, [triviaCooldownEnd, userProfileData?.uid]);

  const startTriviaSession = async () => {
    if (isTriviaLocked()) {
      toast({ title: "Kuis Terkunci", description: `Kamu bisa bermain lagi dalam ${getRemainingLockoutTime()}`, variant: "destructive" });
      return;
    }
    setIsFetchingTrivia(true);
    try {
      const questions: GenerateTriviaQuestionOutput[] = [];
      // Fetch TRIVIA_QUESTIONS_PER_SESSION questions
      for (let i = 0; i < TRIVIA_QUESTIONS_PER_SESSION; i++) {
        const randomTopic = TRIVIA_TOPICS_CONTEXT[Math.floor(Math.random() * TRIVIA_TOPICS_CONTEXT.length)];
        // TODO: Consider adding retries or more robust error handling for AI call
        const question = await generateTriviaQuestion({ topic: randomTopic });
        questions.push({...question, topic: randomTopic }); // Ensure topic is added if not directly returned
      }
      setTriviaSessionQuestions(questions);
      setTriviaLives(INITIAL_TRIVIA_LIVES);
      setTriviaCurrentQuestionIndex(0);
      setTriviaSessionActive(true);
    } catch (error) {
      console.error("Gagal mengambil pertanyaan kuis:", error);
      toast({ title: "Gagal Memulai Kuis", description: "Tidak dapat memuat pertanyaan. Silakan coba lagi nanti.", variant: "destructive" });
      setTriviaSessionActive(false); // Ensure session is not active on error
    } finally {
      setIsFetchingTrivia(false);
    }
  };

  const submitTriviaAnswer = (selectedIndex: number): { correct: boolean; correctAnswerText: string; gameOver: boolean } => {
    if (!triviaSessionActive || triviaSessionQuestions.length === 0 || triviaCurrentQuestionIndex >= triviaSessionQuestions.length) {
      // Should not happen if UI is correctly managed
      return { correct: false, correctAnswerText: '', gameOver: false };
    }
    const currentQuestion = triviaSessionQuestions[triviaCurrentQuestionIndex];
    const isCorrect = selectedIndex === currentQuestion.correctAnswerIndex;
    let gameOver = false;

    if (isCorrect) {
      addCoins(COINS_PER_CORRECT_ANSWER_TRIVIA);
      playSound('correctAnswer');
    } else {
      const newLives = triviaLives - 1;
      setTriviaLives(newLives);
      playSound('incorrectAnswer');
      if (newLives <= 0) {
        gameOver = true;
        // Set cooldown to start of next day
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0); // Midnight
        setTriviaCooldownEnd(tomorrow.getTime());
        if (userProfileData?.uid) { // Save to localStorage if user is identifiable
          localStorage.setItem(`triviaCooldownEnd_${userProfileData.uid}`, tomorrow.getTime().toString());
        }
        setTriviaSessionActive(false); // End session immediately on game over
        toast({ title: "Game Over!", description: "Nyawamu habis. Kuis akan terbuka besok.", variant: "destructive" });
      }
    }
    return { correct: isCorrect, correctAnswerText: currentQuestion.options[currentQuestion.correctAnswerIndex], gameOver };
  };

  const proceedToNextQuestion = (): { sessionComplete: boolean } => {
    if (!triviaSessionActive) { // If game over or session already ended
      setTriviaSessionActive(false); // Ensure it's marked as inactive
      return { sessionComplete: true };
    }

    if (triviaCurrentQuestionIndex < TRIVIA_QUESTIONS_PER_SESSION - 1) {
      setTriviaCurrentQuestionIndex(prevIndex => prevIndex + 1);
      return { sessionComplete: false };
    } else {
      // Last question answered, session complete
      setTriviaSessionActive(false); // Mark session as inactive
      toast({ title: "Sesi Selesai!", description: `Kamu telah menyelesaikan ${TRIVIA_QUESTIONS_PER_SESSION} pertanyaan.`, variant: "default" });
      return { sessionComplete: true };
    }
  };
  
  const getTriviaQuestionCount = () => TRIVIA_QUESTIONS_PER_SESSION;
  
  const getLeaderboardData = async (): Promise<LeaderboardEntry[]> => {
    const usersColRef = collection(db, 'users');
    // For scalability, this query should be limited and paginated in a real app,
    // or use aggregated data from Cloud Functions.
    // For now, we fetch all and sort client-side, which is fine for smaller user bases.
    const q = query(usersColRef); 
    
    const querySnapshot = await getDocs(q);
    
    const leaderboardData: Omit<LeaderboardEntry, 'rank' | 'title' | 'icon'>[] = [];
    querySnapshot.forEach((userDoc) => {
      const data = userDoc.data() as UserProfileData;
      leaderboardData.push({
        id: userDoc.id,
        name: data.displayName || data.email || 'Anonim', // Fallback to email if displayName is not set
        uniqueStickerCount: Array.isArray(data.collectedStickerIds) ? new Set(data.collectedStickerIds).size : 0,
        avatarUrl: data.photoURL, // This will be used by the Avatar component in LeaderboardPage
      });
    });

    // Sort by uniqueStickerCount descending, then by name ascending for ties
    leaderboardData.sort((a, b) => {
      if (b.uniqueStickerCount !== a.uniqueStickerCount) {
        return b.uniqueStickerCount - a.uniqueStickerCount;
      }
      return a.name.localeCompare(b.name);
    });
    
    // Add rank and titles
    return leaderboardData.map((entry, index) => {
      let title = 'Kolektor';
      let icon = <Star className="h-4 w-4 text-muted-foreground" />; // Default icon
      if (index === 0) {
        title = 'Master Cendekia';
        icon = <Trophy className="h-5 w-5 text-yellow-400" />;
      } else if (index === 1) {
        title = 'Pakar Stiker';
        icon = <ShieldCheck className="h-5 w-5 text-slate-400" />; // Using slate for silver-like
      } else if (index === 2) {
        title = 'Kolektor Ahli';
        icon = <Award className="h-5 w-5 text-yellow-600" />; // Using a different yellow for bronze-like
      } else if (entry.uniqueStickerCount >= (ALL_STICKERS_DATA.length * 0.5)) { // Example: 50% completion
         title = 'Kolektor Andal';
         icon = <Star className="h-4 w-4 text-green-500" />;
      }

      return {
        ...entry,
        rank: index + 1,
        title,
        icon,
      };
    });
  };


  return (
    <GameContext.Provider value={{
      currentUser,
      userProfileData,
      coins,
      collectedStickers,
      allStickers,
      stickerBookMilestones,
      gachaCost,
      lastPulledSticker,
      lastRewardMessage,
      isAuthenticated,
      isAuthLoading,
      isSavingData,
      registerUser,
      loginUser,
      logoutUser,
      updateUserProfileName,
      addCoins,
      spendCoins,
      addStickerToCollection,
      isStickerCollected,
      setLastPulledSticker,
      clearLastRewardMessage,
      getUnlockedMilestone,
      markMilestoneAchieved,
      isFetchingTrivia,
      triviaLives,
      triviaSessionActive,
      triviaCurrentQuestionIndex,
      triviaSessionQuestions,
      triviaCooldownEnd,
      startTriviaSession,
      submitTriviaAnswer,
      proceedToNextQuestion,
      isTriviaLocked,
      getRemainingLockoutTime,
      getTriviaQuestionCount,
      getLeaderboardData,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

