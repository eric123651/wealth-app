"use client";

import { useState } from "react";

const MOCK_RATES: Record<string, number> = {
    TWD: 1,
    USD: 31.5,
    CNY: 4.4,
};

export default function CashFlowPredictor({
    liquidAssetsByCurrency,
    liabilitiesMonthlyByCurrency
}: {
    liquidAssetsByCurrency: Record<string, number>,
    liabilitiesMonthlyByCurrency: Record<string, number>
}) {
    const [baseCurrency, setBaseCurrency] = useState<string>("TWD");

    const allCurrencies = Array.from(new Set([
        ...Object.keys(liquidAssetsByCurrency),
        ...Object.keys(liabilitiesMonthlyByCurrency)
    ]));

    let consolidatedLiquid = 0;
    let consolidatedLiabilityMonthly = 0;

    allCurrencies.forEach(c => {
        const rateToTWD = MOCK_RATES[c] || 1;
        const rateToBase = MOCK_RATES[baseCurrency] || 1;
        const conversionRate = rateToTWD / rateToBase;

        const liquid = liquidAssetsByCurrency[c] || 0;
        const liabMonthly = liabilitiesMonthlyByCurrency[c] || 0;

        consolidatedLiquid += liquid * conversionRate;
        consolidatedLiabilityMonthly += liabMonthly * conversionRate;
    });

    const expectedEndOfMonthCash = consolidatedLiquid - consolidatedLiabilityMonthly;

    return (
        <div className="glass rounded-2xl p-6 flex flex-col justify-center items-center text-center space-y-4 relative">
            <div className="absolute top-4 right-4">
                <select
                    value={baseCurrency}
                    onChange={e => setBaseCurrency(e.target.value)}
                    className="px-2 py-1 rounded-lg border bg-white/80 dark:bg-slate-900/80 focus:ring-2 focus:ring-emerald-500 outline-none text-xs transition-shadow text-slate-600 dark:text-slate-300"
                >
                    <option value="TWD">TWD</option>
                    <option value="USD">USD</option>
                    <option value="CNY">CNY</option>
                </select>
            </div>

            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔮</span>
            </div>
            <h3 className="text-lg font-semibold">預測未來現金流 ({baseCurrency})</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                總結算：流動資產 - 每期應繳負債
            </p>
            <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-500">流動可用</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {consolidatedLiquid.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-rose-500">應繳負債</span>
                    <span className="font-semibold text-rose-600">
                        -{consolidatedLiabilityMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                </div>
                <div className="h-px w-full bg-slate-200 dark:bg-slate-700 my-2" />
                <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-800 dark:text-slate-200">期末預估</span>
                    <span className={`text-xl font-bold ${expectedEndOfMonthCash >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        ${expectedEndOfMonthCash.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                </div>
            </div>
        </div>
    );
}
