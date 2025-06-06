'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGame } from '@/context/game-context';
import { LogOut, UserCircle2 } from 'lucide-react';
import { useClientTranslations } from '@/context/i18n-client-context';
import type { Locale } from '@/config/i18n.config';

export default function ProfilePage({ params: { locale } }: { params: { locale: Locale }}) {
  const { logoutUser } = useGame();
  const { t } = useClientTranslations(locale);

  const handleLogout = () => {
    logoutUser();
    // The redirect will be handled by the layout based on isAuthenticated state
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="flex flex-col items-center">
            <UserCircle2 className="h-16 w-16 text-primary mb-3" />
            <CardTitle className="text-3xl font-headline text-primary">{t('profile.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            {t('profile.welcomeMessage')}
          </p>
          <Button onClick={handleLogout} variant="destructive" className="w-full">
            <LogOut className="mr-2 h-5 w-5" />
            {t('profile.logoutButton')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
