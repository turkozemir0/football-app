import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { APP_LOCALES, AppLocale } from '@/lib/constants';

export function generateStaticParams() {
  return APP_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!APP_LOCALES.includes(locale as AppLocale)) {
    notFound();
  }

  setRequestLocale(locale as AppLocale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="min-h-screen">
        <Header />
        <div className="mx-auto flex max-w-6xl justify-end gap-3 px-6 pt-4">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}
