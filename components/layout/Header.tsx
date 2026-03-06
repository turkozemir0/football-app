import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function Header() {
  const t = useTranslations();

  return (
    <header className="border-b border-slate-800 px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          {t('common.appName')} ⚽
        </Link>
        <nav className="flex gap-4 text-sm text-slate-300">
          <Link href="/matches">{t('nav.matches')}</Link>
          <Link href="/predictions">{t('nav.predictions')}</Link>
          <Link href="/leagues">{t('nav.leagues')}</Link>
          <Link href="/analysis">{t('nav.analysis')}</Link>
          <Link href="/pricing">{t('common.premium')}</Link>
        </nav>
      </div>
    </header>
  );
}
