import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Wealth App",
  description: "Personal Property and Investment Management",
  manifest: "/manifest.json",
  themeColor: "#4f46e5",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wealth App",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW" className="antialiased" style={{ colorScheme: 'light' }}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        {/* Lock to light mode so Safari doesn't wash out colors */}
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </head>
      <body className={`${inter.className} min-h-screen text-slate-800 dark:text-slate-100 flex flex-col`}>
        <Navbar />
        <main className="flex-grow pt-20 pb-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
