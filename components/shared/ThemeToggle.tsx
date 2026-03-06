'use client';

import { useState } from 'react';

export function ThemeToggle() {
  const [dark, setDark] = useState(true);
  return (
    <button className="rounded border px-2 py-1 text-xs" onClick={() => setDark((v) => !v)}>
      Theme: {dark ? 'Dark' : 'Light'}
    </button>
  );
}
