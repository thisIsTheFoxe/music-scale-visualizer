import { Inter } from 'next/font/google';
import type { Metadata } from "next";
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Music Scale Visualizer",
  description: "Interactive music scale visualization tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="touch-manipulation">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`${inter.className} overscroll-none`}>{children}</body>
    </html>
  );
}
