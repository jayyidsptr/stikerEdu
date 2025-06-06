
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useGame } from '@/context/game-context';
import { LogOut, UserCircle2, Coins, Sparkles, Mail, Edit3, Save, Loader2, XCircle, Camera } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { 
    currentUser, 
    userProfileData, 
    coins, 
    logoutUser, 
    updateUserProfileName, 
    isSavingData, 
    isAuthLoading
  } = useGame();
  const { toast } = useToast();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');

  useEffect(() => {
    // Initialize newDisplayName when user data is available or changes,
    // but only if not currently editing.
    // When editing starts, handleNameEditToggle will set the initial value.
    if (!isEditingName) {
      setNewDisplayName(currentUser?.displayName || userProfileData?.displayName || '');
    }
  }, [currentUser?.displayName, userProfileData?.displayName, isEditingName]);


  const handleLogout = () => {
    logoutUser();
  };

  const handleNameEditToggle = () => {
    if (isEditingName) { // Currently editing, about to cancel/exit edit mode
      // Reset newDisplayName to current profile name upon cancellation via toggle
      setNewDisplayName(currentUser?.displayName || userProfileData?.displayName || '');
    } else { // Not editing, about to start editing
      // Ensure newDisplayName is up-to-date with current profile name when starting to edit
      setNewDisplayName(currentUser?.displayName || userProfileData?.displayName || '');
    }
    setIsEditingName(!isEditingName);
  };

  const handleNameSave = async () => {
    if (!newDisplayName.trim()) {
      toast({ title: "Nama Tidak Valid", description: "Nama tidak boleh kosong.", variant: "destructive" });
      return;
    }
    // Avoid saving if name hasn't changed
    if (newDisplayName === (currentUser?.displayName || userProfileData?.displayName)) {
      setIsEditingName(false); 
      return;
    }
    await updateUserProfileName(newDisplayName);
    setIsEditingName(false);
  };
  
  const handleCancelEditName = () => {
    setNewDisplayName(currentUser?.displayName || userProfileData?.displayName || '');
    setIsEditingName(false);
  };

  const uniqueStickerCount = userProfileData?.collectedStickerIds 
    ? new Set(userProfileData.collectedStickerIds).size 
    : 0;

  // Simplified loading condition: show loader if auth/data is still loading
  if (isAuthLoading) { 
    return (
      <div className="flex flex-col items-center justify-center space-y-8 py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Memuat data profil...</p>
      </div>
    );
  }
  
  // Fallback if not loading but user is somehow not available (layout should handle redirects)
  if (!currentUser) {
     return (
      <div className="flex flex-col items-center justify-center space-y-8 py-10">
        <p className="text-muted-foreground">Pengguna tidak ditemukan atau tidak login.</p>
      </div>
    );
  }
  
  const currentName = currentUser?.displayName || userProfileData?.displayName || '';
  const currentEmail = currentUser?.email || userProfileData?.email || '';

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="items-center text-center">
          <div className="relative">
            <Avatar className="h-28 w-28 mb-4 border-4 border-primary/30 shadow-md">
              <AvatarFallback className="text-5xl bg-secondary/50 text-secondary-foreground">
                {currentName ? currentName.substring(0, 1).toUpperCase() : 
                 currentEmail ? currentEmail.substring(0, 1).toUpperCase() : 
                 <UserCircle2 className="h-14 w-14" />}
              </AvatarFallback>
            </Avatar>
            {/* Photo upload functionality removed based on previous request */}
          </div>
          
          {isEditingName ? (
            <div className="flex flex-col items-center gap-2 w-full max-w-xs px-4 mt-2">
              <Input
                id="displayName"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder="Nama Tampilan Kamu"
                className="text-center text-lg" // Standard text size for input
                disabled={isSavingData}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <Button onClick={handleNameSave} size="sm" variant="default" disabled={isSavingData} aria-label="Simpan Nama">
                  {isSavingData ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span className="ml-1">Simpan</span>
                </Button>
                <Button onClick={handleCancelEditName} size="sm" variant="outline" disabled={isSavingData} aria-label="Batal Edit Nama">
                   <XCircle className="h-4 w-4" />
                   <span className="ml-1">Batal</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-2">
              <CardTitle className="text-3xl font-headline text-primary break-all max-w-[200px] sm:max-w-xs md:max-w-sm">
                {currentName || 'Profil Kamu'}
              </CardTitle>
              <Button onClick={handleNameEditToggle} size="icon" variant="ghost" aria-label="Edit Nama" className="shrink-0" disabled={isSavingData}>
                <Edit3 className="h-5 w-5 text-muted-foreground hover:text-primary" />
              </Button>
            </div>
          )}

          {currentEmail && (
            <CardDescription className="flex items-center gap-1 text-muted-foreground mt-1 text-sm">
              <Mail className="h-4 w-4" /> {currentEmail}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center text-primary mb-1">
                <Coins className="h-7 w-7 mr-1" />
                <p className="text-2xl font-bold">{coins}</p>
              </div>
              <p className="text-sm text-muted-foreground">Koin Dimiliki</p>
            </div>
            <div>
              <div className="flex items-center justify-center text-primary mb-1">
                <Sparkles className="h-7 w-7 mr-1" />
                <p className="text-2xl font-bold">{uniqueStickerCount}</p>
              </div>
              <p className="text-sm text-muted-foreground">Stiker Unik</p>
            </div>
          </div>

          <p className="text-sm text-center text-muted-foreground px-4">
            Kelola detail akunmu dan lihat progresmu di sini.
          </p>
          
          <Button onClick={handleLogout} variant="destructive" className="w-full" disabled={isSavingData || isAuthLoading}>
            <LogOut className="mr-2 h-5 w-5" />
            Keluar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
