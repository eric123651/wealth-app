"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, WalletCards, TrendingUp, MessageSquareText } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
    const pathname = usePathname();

    const navItems = [
        { name: "總覽Dashboard", href: "/", icon: LayoutDashboard },
        { name: "資產與負債", href: "/accounts", icon: WalletCards },
        { name: "投資組合", href: "/investments", icon: TrendingUp },
        { name: "AI記帳", href: "/chat", icon: MessageSquareText },
    ];

    return (
        <>
            {/* Desktop Top Navbar */}
            <header className="fixed top-0 w-full z-50 glass hidden md:block">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex-shrink-0">
                            <Link href="/" className="font-bold text-2xl tracking-tighter text-indigo-600 dark:text-indigo-400">
                                WealthApp
                            </Link>
                        </div>
                        <nav className="flex space-x-8">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 hover:text-indigo-500 dark:text-slate-300"
                                            }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <Icon size={18} />
                                            {item.name}
                                        </span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="navbar-indicator"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                                                initial={false}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 w-full z-50 glass md:hidden pb-safe">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
                                    }`}
                            >
                                <Icon size={24} className={isActive ? "scale-110 transition-transform" : ""} />
                                <span className="text-[10px] font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
