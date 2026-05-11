import './globals.css';

export const metadata = {
  title: 'Resume Tailor — Jayshri Dalvi',
  description: 'Programmatic resume builder. Pick a variant and download a Word document.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
