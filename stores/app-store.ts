import { create } from 'zustand';

interface AppState {
  locale: 'en' | 'tr';
  setLocale: (locale: 'en' | 'tr') => void;
}

export const useAppStore = create<AppState>((set) => ({
  locale: 'en',
  setLocale: (locale) => set({ locale })
}));
