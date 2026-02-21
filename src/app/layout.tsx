import type { Metadata } from 'next';
import ThemeRegistry from '@/components/ThemeRegistry';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Junior Golf Finder',
  description: 'Search and discover junior golf tournaments near you.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <Navbar />
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
