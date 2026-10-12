import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@/styles/quill-custom.css';
import { auth } from '@/auth';
import { SessionProvider } from 'next-auth/react';
import { AdminSidebar } from '@/app/components/Sidebar';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Lubricon Specialities CMS',
    template: '%s | Lubricon Specialities CMS',
  },
  description: 'Manage Lubricon Specialities India catalog, static pages, leads, and SEO',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased bg-[#f4f5f7]`}
        suppressHydrationWarning
      >
        <SessionProvider session={session}>
          {session ? (
            <div className="flex h-screen overflow-hidden font-sans p-[6px]">
              <AdminSidebar />
              <main className="flex-1 overflow-y-auto">
                <div className="px-10 py-8 max-w-7xl mx-auto">{children}</div>
              </main>
            </div>
          ) : (
            <div className="font-sans">{children}</div>
          )}
        </SessionProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { fontFamily: 'var(--font-inter)', fontSize: '14px' },
            error: {
              style: {
                background: '#fff0f0',
                color: '#b91c1c',
                border: '1px solid #fecaca',
              },
            },
            success: {
              style: {
                background: '#f0fdf4',
                color: '#15803d',
                border: '1px solid #bbf7d0',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
