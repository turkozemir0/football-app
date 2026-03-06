import { getRequestConfig } from 'next-intl/server';
import { APP_LOCALES, DEFAULT_LOCALE } from '@/lib/constants';

export default getRequestConfig(async ({ locale }) => {
  const normalizedLocale = APP_LOCALES.includes((locale ?? DEFAULT_LOCALE) as (typeof APP_LOCALES)[number])
    ? (locale as (typeof APP_LOCALES)[number])
    : DEFAULT_LOCALE;

  return {
    locale: normalizedLocale,
    messages: (await import(`../messages/${normalizedLocale}.json`)).default
  };
});
