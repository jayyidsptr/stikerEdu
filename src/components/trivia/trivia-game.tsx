
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/context/game-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { TriviaQuestion as GenerateTriviaQuestionOutput } from '@/types';
import { Lightbulb, CheckCircle2, XCircle, Loader2, Sparkles, Coins, Heart, Play, RotateCcw, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const COINS_PER_CORRECT_ANSWER = 5; 
const INITIAL_TRIVIA_LIVES = 3; 

export default function TriviaGame() {
  const {
    addCoins, 
    startTriviaSession,
    submitTriviaAnswer,
    proceedToNextQuestion,
    isTriviaLocked,
    getRemainingLockoutTime,
    isFetchingTrivia,
    triviaLives,
    triviaSessionActive,
    triviaCurrentQuestionIndex,
    triviaSessionQuestions,
    getTriviaQuestionCount,
  } = useGame();

  const [localSelectedAnswer, setLocalSelectedAnswer] = useState<number | null>(null);
  const [localFeedback, setLocalFeedback] = useState<{ type: 'correct' | 'incorrect'; message: string; gameOver?: boolean; sessionComplete?: boolean } | null>(null);
  const [score, setScore] = useState(0); 
  const [remainingLockoutTimeString, setRemainingLockoutTimeString] = useState<string | null>(null);
  const [isClientReady, setIsClientReady] = useState(false);

  useEffect(() => {
    setIsClientReady(true); // Component has mounted on client
  }, []);

  useEffect(() => {
    if (isClientReady && isTriviaLocked()) {
      const intervalId = setInterval(() => {
        const timeStr = getRemainingLockoutTime();
        setRemainingLockoutTimeString(timeStr);
        if (!timeStr) clearInterval(intervalId); 
      }, 1000);
      setRemainingLockoutTimeString(getRemainingLockoutTime()); 
      return () => clearInterval(intervalId);
    } else if (isClientReady && !isTriviaLocked()) {
      setRemainingLockoutTimeString(null);
    }
  }, [isClientReady, isTriviaLocked, getRemainingLockoutTime]);

  const handleAnswerSubmit = (selectedIndex: number) => {
    if (localFeedback) return; 

    setLocalSelectedAnswer(selectedIndex);
    const result = submitTriviaAnswer(selectedIndex);

    let feedbackMessage = result.correct 
      ? "Jawaban Benar! Kamu mendapatkan koin!" 
      : `Jawaban Salah. Yang benar adalah: ${result.correctAnswerText}`;
    
    if (result.gameOver) {
      feedbackMessage = `Game Over! Nyawamu habis. ${feedbackMessage}`;
    }
    
    setLocalFeedback({
      type: result.correct ? 'correct' : 'incorrect',
      message: feedbackMessage,
      gameOver: result.gameOver,
      sessionComplete: !result.gameOver && triviaCurrentQuestionIndex === getTriviaQuestionCount() - 1,
    });

    if (result.correct) {
      setScore(prev => prev + COINS_PER_CORRECT_ANSWER_TRIVIA);
    }
  };

  const handleProceed = () => {
    proceedToNextQuestion(); 
    setLocalSelectedAnswer(null);
    setLocalFeedback(null);
  };
  
  const handleStartSession = async () => {
    setScore(0); 
    setLocalFeedback(null);
    setLocalSelectedAnswer(null);
    await startTriviaSession();
  }

  if (isFetchingTrivia) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-xl text-center p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Memuat...</p>
      </Card>
    );
  }

  if (isClientReady && isTriviaLocked()) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-xl text-center p-8">
        <Lock className="h-12 w-12 text-destructive mx-auto mb-4" />
        <CardTitle className="text-xl font-semibold">Kuis Terkunci</CardTitle>
        <CardDescription className="text-muted-foreground mt-2">
          Kamu bisa bermain lagi dalam: {remainingLockoutTimeString || "Memuat..."}
        </CardDescription>
         <Button onClick={() => window.location.reload()} className="mt-6">
          <RotateCcw className="mr-2 h-4 w-4" /> Cek Ulang
        </Button>
      </Card>
    );
  }

  if (!triviaSessionActive) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-xl text-center p-8">
        <Lightbulb className="h-12 w-12 text-primary mx-auto mb-4" />
        <CardTitle className="text-2xl font-headline">Siap untuk Kuis?</CardTitle>
        <CardDescription className="text-muted-foreground mt-2 mb-6">
          Jawab {getTriviaQuestionCount()} pertanyaan dan uji pengetahuanmu! Kamu punya {INITIAL_TRIVIA_LIVES} nyawa.
        </CardDescription>
        <Button onClick={handleStartSession} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Play className="mr-2 h-5 w-5" /> Mulai Kuis
        </Button>
      </Card>
    );
  }
  
  const currentQuestionData = triviaSessionQuestions[triviaCurrentQuestionIndex];
  if (!currentQuestionData) {
     return (
      <Card className="w-full max-w-2xl mx-auto shadow-xl text-center p-8">
        <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <CardTitle className="text-xl font-semibold">Gagal memuat pertanyaan.</CardTitle>
        <Button onClick={handleStartSession} className="mt-4">
          Coba Mulai Lagi
        </Button>
      </Card>
    );
  }

  const questionNumber = triviaCurrentQuestionIndex + 1;
  const totalQuestions = getTriviaQuestionCount();

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-2xl font-headline text-primary flex items-center gap-2">
            <Lightbulb className="h-7 w-7" />
            Kuis Trivia! ({questionNumber}/{totalQuestions})
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-lg font-semibold text-destructive">
              {[...Array(INITIAL_TRIVIA_LIVES)].map((_, i) => (
                <Heart key={i} className={cn("h-6 w-6", i < triviaLives ? 'fill-destructive text-destructive' : 'text-muted-foreground opacity-50')} />
              ))}
            </div>
            <div className="flex items-center gap-1 text-lg font-semibold text-accent">
              <Coins className="h-6 w-6 text-primary"/> 
              <span className="ml-1">{score} Poin</span>
            </div>
          </div>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
           Topik: {currentQuestionData.topic || "Umum"}
        </CardDescription>
        <CardDescription className="text-muted-foreground pt-2 text-lg min-h-[60px]">
          {currentQuestionData.question}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {currentQuestionData.options.map((option, index) => (
          <Button
            key={index}
            variant="outline"
            size="lg"
            className={cn(
              "w-full justify-start text-left h-auto py-3 text-base",
              localSelectedAnswer === index && localFeedback?.type === 'correct' && 'bg-green-500/20 border-green-500 text-green-700 hover:bg-green-500/30',
              localSelectedAnswer === index && localFeedback?.type === 'incorrect' && 'bg-red-500/20 border-red-500 text-red-700 hover:bg-red-500/30',
              localSelectedAnswer !== null && index === currentQuestionData.correctAnswerIndex && localFeedback?.type === 'incorrect' && 'bg-green-500/20 border-green-500',
              localFeedback && 'pointer-events-none' 
            )}
            onClick={() => handleAnswerSubmit(index)}
            disabled={localFeedback !== null || isFetchingTrivia}
          >
            {option}
          </Button>
        ))}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-4">
        {localFeedback && (
          <Alert variant={localFeedback.type === 'correct' ? 'default' : 'destructive'} className={cn(localFeedback.type === 'correct' ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10")}>
            {localFeedback.type === 'correct' ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
            <AlertTitle className={cn(localFeedback.type === 'correct' ? "text-green-700" : "text-red-700")}>
              {localFeedback.gameOver ? "Game Over!" : (localFeedback.type === 'correct' ? "Benar!" : "Salah!")}
            </AlertTitle>
            <AlertDescription className={cn(localFeedback.type === 'correct' ? "text-green-600" : "text-red-600")}>
              {localFeedback.message}
            </AlertDescription>
          </Alert>
        )}
        {localFeedback && (
          <Button onClick={handleProceed} disabled={isFetchingTrivia} size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            {isFetchingTrivia ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
            {localFeedback.gameOver ? "Kembali ke Menu" : (localFeedback.sessionComplete || questionNumber === totalQuestions ? "Selesaikan Sesi" : "Pertanyaan Berikutnya")}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
