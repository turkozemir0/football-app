import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <section className="space-y-4">
      <h1 className="text-4xl font-bold">{t('title')}</h1>
      <p className="text-slate-300">{t('description')}</p>
    </section>
  );
}
