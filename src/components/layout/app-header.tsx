
'use client';

export default function AppHeader() {
  return (
    <header className="bg-background shadow-sm sticky top-0 z-50 py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div></div> {/* Spacer to help center the title */}
        <h1 className="text-2xl font-headline font-bold text-foreground text-center">
          EduSticker
        </h1>
        <div></div> {/* Spacer for balance, as LanguageSwitcher was removed */}
      </div>
    </header>
  );
}
