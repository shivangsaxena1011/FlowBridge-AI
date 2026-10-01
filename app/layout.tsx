import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/toast';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'FlowBridge AI — Turn Scattered Work into Clear Action',
  description:
    'FlowBridge captures notes, ideas, meetings, screenshots and files, understands what matters, and turns them into organized work you can actually execute.',
  keywords: [
    'AI productivity',
    'task management',
    'execution layer',
    'voice capture',
    'project planning',
    'focus timer',
    'smart inbox',
  ],
  authors: [{ name: 'FlowBridge Systems Inc.' }],
  openGraph: {
    title: 'FlowBridge AI — Turn Scattered Work into Clear Action',
    description:
      'FlowBridge captures notes, ideas, meetings, screenshots and files, understands what matters, and turns them into organized work you can actually execute.',
    type: 'website',
    locale: 'en_US',
    siteName: 'FlowBridge AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlowBridge AI — Turn Scattered Work into Clear Action',
    description:
      'FlowBridge captures notes, ideas, meetings, screenshots and files, understands what matters, and turns them into organized work you can actually execute.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
