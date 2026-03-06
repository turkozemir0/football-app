import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto flex max-w-6xl justify-end gap-3 px-6 pt-4">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
      <Footer />
    </div>
  );
}
