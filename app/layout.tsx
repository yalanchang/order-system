import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '自助點餐系統',
  description: '快速、便捷的自助點餐體驗',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen bg-pattern">
        {children}
      </body>
    </html>
  );
}