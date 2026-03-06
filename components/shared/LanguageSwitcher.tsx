'use client';

import { usePathname, useRouter } from 'next/navigation';

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (locale: 'en' | 'tr') => {
    const normalized = pathname.replace(/^\/(en|tr)/, '');
    router.push(locale === 'en' ? normalized || '/' : `/${locale}${normalized || '/'}`);
  };

  return (
    <div className="flex gap-2">
      <button onClick={() => switchLocale('en')} className="rounded border px-2 py-1 text-xs">EN</button>
      <button onClick={() => switchLocale('tr')} className="rounded border px-2 py-1 text-xs">TR</button>
    </div>
  );
}
