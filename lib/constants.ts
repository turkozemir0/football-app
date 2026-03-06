export const FEATURED_LEAGUES = {
  PREMIER_LEAGUE: 39,
  LA_LIGA: 140,
  SERIE_A: 135,
  BUNDESLIGA: 78,
  LIGUE_1: 61,
  CHAMPIONS_LEAGUE: 2,
  EUROPA_LEAGUE: 3,
  SUPER_LIG: 203,
  WORLD_CUP: 1,
  EURO: 4
} as const;

export const CURRENT_SEASON = 2025;

export const APP_LOCALES = ['en', 'tr'] as const;
export type AppLocale = (typeof APP_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'en';
