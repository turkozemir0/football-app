import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('common');

  return (
    <footer className="border-t border-slate-800 px-6 py-6 text-center text-xs text-slate-400">
      {t('tagline')}
    </footer>
  );
}
