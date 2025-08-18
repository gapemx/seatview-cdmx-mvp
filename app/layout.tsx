import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SeatView CDMX',
  description: 'Photos & ratings from real seats in Mexico City venues',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <header className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
            <a href="/" className="font-semibold tracking-tight">SeatView</a>
            <nav className="text-sm opacity-90">CDMX · MVP</nav>
          </div>
        </header>
        <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
        <footer className="py-8 text-center text-xs text-slate-500">
          Hecho con ❤️ — MVP comunitario
        </footer>
      </body>
    </html>
  );
}
