import type { Metadata } from 'next';
import './globals.css';
import CSRFInitializer from '@/components/CSRFInitializer';

export const metadata: Metadata = {
  title: 'Insighta Labs+',
  description: 'Profile Intelligence System'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f9fafb', color: '#111827' }}>
        <CSRFInitializer />
        {children}
      </body>
    </html>
  );
}