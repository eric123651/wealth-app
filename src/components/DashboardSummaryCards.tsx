"use client";

import { useState } from "react";
import { Wallet, Building2, Landmark, TrendingUp } from "lucide-react";

// Mock exchange rates scaled to TWD for estimation calculation
const MOCK_RATES: Record<string, number> = {
    TWD: 1,
    USD: 31.5,
    CNY: 4.4,
};

type TotalsByCurrency = {
    currency: string;
    assets: number;
    liabilities: number;
    netWorth: number;
    investments: number;
};

export default function DashboardSummaryCards({ totals }: { totals: TotalsByCurrency[] }) {
    const [baseCurrency, setBaseCurrency] = useState<string>("TWD");
    const [showConsolidated, setShowConsolidated] = useState<boolean>(true);

    const consolidated = totals.reduce((acc, t) => {
        const rateToTWD = MOCK_RATES[t.currency] || 1;
        const rateToBase = MOCK_RATES[baseCurrency] || 1;
        const conversionRate = rateToTWD / rateToBase;

        acc.assets += t.assets * conversionRate;
        acc.liabilities += t.liabilities * conversionRate;
        acc.netWorth += t.netWorth * conversionRate;
        acc.investments += t.investments * conversionRate;
        return acc;
    }, { assets: 0, liabilities: 0, netWorth: 0, investments: 0 });

    return (
        <div className="space-y-4">
            <div className="flex justify-end gap-4 items-center">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800 dark:text-slate-200">
                    <input
                        type="checkbox"
                        checked={showConsolidated}
                        onChange={e => setShowConsolidated(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    以特定幣別顯示總計
                </label>
                {showConsolidated && (
                    <select
                        value={baseCurrency}
                        onChange={e => setBaseCurrency(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border bg-white/80 dark:bg-slate-900/80 focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-shadow"
                    >
                        <option value="TWD">TWD (台幣)</option>
                        <option value="USD">USD (美金)</option>
                        <option value="CNY">CNY (人民幣)</option>
                    </select>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Net Worth */}
                <div className="glass card-hover rounded-2xl p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">總淨值Net Worth</h3>
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg shrink-0">
                            <Landmark className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                    <div className="space-y-2 flex-1 flex flex-col justify-end">
                        {showConsolidated ? (
                            <div className="flex items-baseline justify-between border-b border-indigo-100/50 dark:border-indigo-900/50 pb-1">
                                <span className="text-sm font-semibold text-indigo-500/70 dark:text-indigo-400/70 mr-2">{baseCurrency}</span>
                                <p className="text-2xl font-bold tracking-tight text-indigo-700 dark:text-indigo-300">
                                    {consolidated.netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                        ) : totals.length > 0 ? totals.map(t => (
                            <div key={t.currency} className="flex items-baseline justify-between border-b border-indigo-100/50 dark:border-indigo-900/50 last:border-0 pb-1 last:pb-0">
                                <span className="text-sm font-semibold text-indigo-500/70 dark:text-indigo-400/70 mr-2">{t.currency}</span>
                                <p className="text-2xl font-bold tracking-tight text-indigo-700 dark:text-indigo-300">
                                    {t.netWorth.toLocaleString()}
                                </p>
                            </div>
                        )) : <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">0</p>}
                    </div>
                </div>

                {/* Total Assets */}
                <div className="glass card-hover rounded-2xl p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">總資產 Total Assets</h3>
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg shrink-0">
                            <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <div className="space-y-2 flex-1 flex flex-col justify-end">
                        {showConsolidated ? (
                            <div className="flex items-baseline justify-between border-b border-emerald-100/50 dark:border-emerald-900/50 pb-1">
                                <span className="text-sm font-semibold text-emerald-500/70 dark:text-emerald-400/70 mr-2">{baseCurrency}</span>
                                <p className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                                    {consolidated.assets.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                        ) : totals.length > 0 ? totals.map(t => (
                            <div key={t.currency} className="flex items-baseline justify-between border-b border-emerald-100/50 dark:border-emerald-900/50 last:border-0 pb-1 last:pb-0">
                                <span className="text-sm font-semibold text-emerald-500/70 dark:text-emerald-400/70 mr-2">{t.currency}</span>
                                <p className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">{t.assets.toLocaleString()}</p>
                            </div>
                        )) : <p className="text-2xl font-bold">0</p>}
                    </div>
                </div>

                {/* Liabilities */}
                <div className="glass card-hover rounded-2xl p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">總負債 Liabilities</h3>
                        <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg shrink-0">
                            <Building2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        </div>
                    </div>
                    <div className="space-y-2 flex-1 flex flex-col justify-end">
                        {showConsolidated ? (
                            <div className="flex items-baseline justify-between border-b border-rose-100/50 dark:border-rose-900/50 pb-1">
                                <span className="text-sm font-semibold text-rose-500/70 dark:text-rose-400/70 mr-2">{baseCurrency}</span>
                                <p className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                                    {consolidated.liabilities.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                        ) : totals.length > 0 ? totals.map(t => (
                            <div key={t.currency} className="flex items-baseline justify-between border-b border-rose-100/50 dark:border-rose-900/50 last:border-0 pb-1 last:pb-0">
                                <span className="text-sm font-semibold text-rose-500/70 dark:text-rose-400/70 mr-2">{t.currency}</span>
                                <p className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">{t.liabilities.toLocaleString()}</p>
                            </div>
                        )) : <p className="text-2xl font-bold">0</p>}
                    </div>
                </div>

                {/* Investments */}
                <div className="glass card-hover rounded-2xl p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">投資組合 Investments</h3>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0">
                            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div className="space-y-2 flex-1 flex flex-col justify-end">
                        {showConsolidated ? (
                            <div className="flex items-baseline justify-between border-b border-blue-100/50 dark:border-blue-900/50 pb-1">
                                <span className="text-sm font-semibold text-blue-500/70 dark:text-blue-400/70 mr-2">{baseCurrency}</span>
                                <p className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                                    {consolidated.investments.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                        ) : totals.length > 0 ? totals.map(t => (
                            <div key={t.currency} className="flex items-baseline justify-between border-b border-blue-100/50 dark:border-blue-900/50 last:border-0 pb-1 last:pb-0">
                                <span className="text-sm font-semibold text-blue-500/70 dark:text-blue-400/70 mr-2">{t.currency}</span>
                                <p className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                                    {t.investments.toLocaleString()}
                                </p>
                            </div>
                        )) : <p className="text-2xl font-bold">0</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
