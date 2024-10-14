import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Suspense } from 'react';
import Providers from '@/providers/providers';
import AuthController from '@/providers/AuthController';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Chowlive Africa',
  description: 'Unity friends on chain',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <Suspense>
          <Providers>
            <AuthController>{children}</AuthController>
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}
