'use client';

import AuthForm from '@/components/auth/auth-form';
import type { Locale } from '@/config/i18n.config';

export default function AuthPage({ params: { locale } }: { params: { locale: Locale }}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <AuthForm locale={locale} />
    </div>
  );
}
