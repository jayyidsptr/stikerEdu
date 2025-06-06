
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGame } from '@/context/game-context';
import { Separator } from '@/components/ui/separator';
import { Chrome, Loader2, UserPlus, LogIn } from 'lucide-react';

export default function AuthForm() {
  const { registerUser, loginUser, isAuthenticated, isAuthLoading } = useGame();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(''); // For registration
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined' && !isAuthLoading) {
      router.replace('/');
    }
  }, [isAuthenticated, router, isAuthLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (isLoginMode) {
        await loginUser(email, password);
      } else {
        if (!displayName.trim()) {
            setError("Nama tampilan tidak boleh kosong.");
            setIsLoading(false);
            return;
        }
        await registerUser(email, password, displayName);
      }
      // Navigation will be handled by the useEffect above.
    } catch (err: any) {
      if (isLoginMode) {
        // Jika login gagal, arahkan ke mode registrasi
        setError("Login gagal. Akun tidak ditemukan atau kata sandi salah. Silakan coba mendaftar.");
        setIsLoginMode(false);
        // Kosongkan field password karena mungkin salah
        setPassword('');
      } else {
        // Jika registrasi gagal, tampilkan error registrasi
        setError(err.message || "Gagal mendaftar.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading && !isAuthenticated) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
  }
  
  if (isAuthenticated) {
     return null;
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {isLoginMode ? <LogIn className="h-12 w-12 text-primary" /> : <UserPlus className="h-12 w-12 text-primary" />}
        </div>
        <CardTitle className="text-3xl font-headline text-primary">
          {isLoginMode ? 'Selamat Datang Kembali!' : 'Buat Akun Baru'}
        </CardTitle>
        <CardDescription className="font-body">
          {isLoginMode ? 'Masuk untuk melanjutkan perjalanan stikermu.' : 'Daftar untuk memulai koleksi stikermu!'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLoginMode && (
            <div className="space-y-2">
              <Label htmlFor="displayName" className="font-body">Nama Tampilan</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Cendekiawan Stiker"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required={!isLoginMode}
                className="bg-input"
                disabled={isLoading}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="font-body">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="kamu@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-input"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-body">Kata Sandi</Label>
            <Input
              id="password"
              type="password"
              placeholder="•••••••• (minimal 6 karakter)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-input"
              disabled={isLoading}
              minLength={6}
            />
          </div>
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading || isAuthLoading}>
            {isLoading || isAuthLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              isLoginMode ? 'Masuk' : 'Daftar'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button variant="link" onClick={() => { setIsLoginMode(!isLoginMode); setError(null); }} disabled={isLoading || isAuthLoading} className="font-body">
          {isLoginMode ? 'Belum punya akun? Daftar di sini' : 'Sudah punya akun? Masuk di sini'}
        </Button>
        <div className="relative w-full">
          <Separator className="my-0" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground font-body">
            Atau lanjut dengan
          </span>
        </div>
        <Button variant="outline" className="w-full" disabled>
          <Chrome className="mr-2 h-5 w-5" />
          Masuk dengan Google
        </Button>
      </CardFooter>
    </Card>
  );
}
