import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KickoffAI',
  description: 'AI-Powered Football Intelligence'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
