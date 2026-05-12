import './globals.css';

export const metadata = {
  title: 'Çözüm Kantin · Veresiye Defteri',
  description: 'Mahalle kantininiz için modern veresiye takip sistemi',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
