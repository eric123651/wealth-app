import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Wealth Dashboard",
  description: "Personal Property and Investment Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW" className="antialiased">
      <body className={`${inter.className} min-h-screen text-slate-800 dark:text-slate-100 flex flex-col`}>
        <Navbar />
        <main className="flex-grow pt-20 pb-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
