import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Wealth App",
  description: "Personal Property and Investment Management",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wealth App",
  },
};

export const viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        {/* Inline script: run before first paint to set dark class — no flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var mq = window.matchMedia('(prefers-color-scheme: dark)');
                if (mq.matches) {
                  document.documentElement.classList.add('dark');
                }
                // Listen for future system changes
                mq.addEventListener('change', function(e) {
                  if (e.matches) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                });
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300`}>
        <Navbar />
        <main className="flex-grow pt-20 pb-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
