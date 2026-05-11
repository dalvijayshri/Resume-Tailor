import './globals.css';

export const metadata = {
  title: 'Resume Tailor — Jayshri Dalvi',
  description: 'Programmatic resume builder. Pick a variant and download a Word document.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
