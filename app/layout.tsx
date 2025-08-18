import './globals.css';

export const metadata = {
  title: 'SeatView CDMX',
  description: 'Photos & ratings from real seats in Mexico City venues',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white text-black">{children}</body>
    </html>
  );
}
