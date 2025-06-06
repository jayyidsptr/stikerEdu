
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Trophy, UserCircle2 } from "lucide-react"; // UserCircle2 untuk fallback avatar
import { useGame } from '@/context/game-context';
import type { LeaderboardEntry } from '@/types';

export default function LeaderboardPage() {
  const { getLeaderboardData, isAuthLoading, currentUser } = useGame(); // Tambahkan isAuthLoading dan currentUser
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hanya fetch leaderboard jika user sudah terautentikasi dan auth loading selesai
    if (!isAuthLoading && currentUser) {
      const fetchLeaderboard = async () => {
        setIsLoading(true);
        try {
          const data = await getLeaderboardData();
          setLeaderboard(data);
        } catch (error) {
          console.error("Failed to fetch leaderboard data:", error);
          // Optionally, show a toast message or error state
        } finally {
          setIsLoading(false);
        }
      };
      fetchLeaderboard();
    } else if (!isAuthLoading && !currentUser) {
      // Jika auth selesai loading dan tidak ada user, jangan fetch dan set loading ke false
      setIsLoading(false);
    }
  }, [getLeaderboardData, isAuthLoading, currentUser]);

  if (isAuthLoading || (isLoading && currentUser)) { // Tampilkan loader jika auth loading atau data leaderboard loading (dan ada user)
    return (
      <div className="flex flex-col items-center justify-center space-y-8 py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Memuat papan peringkat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-8">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="items-center text-center">
          <Trophy className="h-16 w-16 text-primary mb-3" />
          <CardTitle className="text-3xl font-headline text-primary">Papan Peringkat</CardTitle>
          <CardDescription className="text-muted-foreground">
            Lihat siapa cendekiawan stiker teratas berdasarkan koleksi stiker unik!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 && currentUser ? ( // Jika ada user tapi leaderboard kosong
            <p className="text-center text-muted-foreground py-10">
              Belum ada data di papan peringkat. Ayo kumpulkan stiker!
            </p>
          ) : !currentUser ? ( // Jika tidak ada user (belum login)
             <p className="text-center text-muted-foreground py-10">
              Silakan masuk untuk melihat papan peringkat.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-center">#</TableHead>
                  <TableHead>Pengguna</TableHead>
                  <TableHead className="text-right">Stiker Unik</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((user, index) => (
                  <TableRow 
                    key={user.id} 
                    className={index < 3 ? "bg-card hover:bg-secondary/20 font-semibold" : "hover:bg-muted/50"}
                  >
                    <TableCell className="font-bold text-center">{user.rank}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-primary/50">
                          <AvatarImage 
                            src={user.avatarUrl || `https://placehold.co/40x40.png`} 
                            alt={user.name} 
                            data-ai-hint="user avatar"
                          />
                          <AvatarFallback className="text-lg">
                            {user.name ? user.name.substring(0, 1).toUpperCase() : <UserCircle2 className="h-5 w-5" />}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">{user.name}</p>
                           {user.title && ( // Menampilkan title dan icon jika ada
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              {user.icon} {user.title}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-lg text-primary">{user.uniqueStickerCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
