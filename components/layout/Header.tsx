import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b border-slate-800 px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-xl font-bold">KickoffAI ⚽</Link>
        <nav className="flex gap-4 text-sm text-slate-300">
          <Link href="/matches">Matches</Link>
          <Link href="/predictions">Predictions</Link>
          <Link href="/leagues">Leagues</Link>
          <Link href="/pricing">Pricing</Link>
        </nav>
      </div>
    </header>
  );
}
