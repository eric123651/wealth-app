"use client";

import { useState, useEffect } from "react";
import { getInvestments, createInvestment, deleteInvestment, updateInvestmentDetails, syncMarketPrice } from "@/actions/investmentActions";
import { Plus, Trash2, TrendingUp, DollarSign, Minus, RefreshCw } from "lucide-react";

export default function InvestmentsPage() {
    const [investments, setInvestments] = useState<any[]>([]);
    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");
    const [currency, setCurrency] = useState("TWD");
    const [shares, setShares] = useState("");
    const [price, setPrice] = useState("");

    useEffect(() => {
        loadInvestments();
    }, []);

    const loadInvestments = async () => {
        const data = await getInvestments();
        setInvestments(data);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !symbol || !shares || !price) return;
        await createInvestment({
            name,
            symbol,
            type: "STOCK", // Simplified for now
            currency,
            shares: parseFloat(shares),
            averageBuyPrice: parseFloat(price),
            currentPrice: parseFloat(price)
        });
        setName("");
        setSymbol("");
        setCurrency("TWD");
        setShares("");
        setPrice("");
        loadInvestments();
    };

    const handleDelete = async (id: string) => {
        await deleteInvestment(id);
        loadInvestments();
    };

    const handleUpdateInvestment = async (id: string, shares: string | number, currentPrice: string | number, averageBuyPrice: string | number) => {
        const s = Math.max(0, Number(shares) || 0);
        const cp = Math.max(0, Number(currentPrice) || 0);
        const abp = Math.max(0, Number(averageBuyPrice) || 0);
        await updateInvestmentDetails(id, s, cp, abp);
        loadInvestments();
    };

    const handleSyncPrice = async (id: string, symbol: string) => {
        const result = await syncMarketPrice(id, symbol);
        if (result.success) {
            loadInvestments();
        } else {
            alert(`無法更新 ${symbol} 的股價：${result.error}`);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-0">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">投資組合</h1>
                <p className="text-slate-600 dark:text-slate-300 mt-1">追蹤您的股票、基金等金融商品。</p>
            </header>

            <form onSubmit={handleCreate} className="glass p-6 rounded-2xl grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium mb-1">標的名稱</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Nvidia" className="w-full px-4 py-2 rounded-lg border bg-white/50 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">代號</label>
                    <input type="text" required value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="NVDA" className="w-full px-4 py-2 rounded-lg border bg-white/50 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">幣別</label>
                    <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full px-4 py-2 rounded-lg border bg-white/50 focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="TWD">TWD</option>
                        <option value="USD">USD</option>
                        <option value="CNY">CNY</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">持有股數</label>
                    <input type="number" required value={shares} onChange={e => setShares(e.target.value)} placeholder="10" className="w-full px-4 py-2 rounded-lg border bg-white/50 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">現價/均價</label>
                    <input type="number" required value={price} onChange={e => setPrice(e.target.value)} placeholder="1600" className="w-full px-4 py-2 rounded-lg border bg-white/50 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <button type="submit" className="w-full px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center justify-center transition-colors h-[42px]">
                    <Plus className="w-5 h-5 mr-1" /> 新增
                </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {investments.map((item: any) => {
                    const totalValue = item.shares * item.currentPrice;
                    const totalCost = item.shares * item.averageBuyPrice;
                    const profitLoss = totalValue - totalCost;
                    const roi = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;
                    const isPositive = profitLoss >= 0;

                    return (
                        <div key={item.id} className="glass rounded-2xl p-6 relative overflow-hidden card-hover">
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                <TrendingUp size={100} />
                            </div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold">{item.name}</h3>
                                    <p className="text-sm font-mono text-slate-600 dark:text-slate-300">{item.symbol}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white/50 dark:bg-slate-800/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="mt-4 flex flex-col">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">目前總市值</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-lg font-semibold text-indigo-500">{item.currency || "TWD"}</span>
                                    <span className="text-3xl font-bold">{totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className={`text-sm font-medium mt-1 flex items-center gap-1 ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    {isPositive ? '+' : ''}{roi.toFixed(2)}% ({isPositive ? '+' : ''}{profitLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })})
                                </div>
                            </div>

                            <div className="mt-4 flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <div className="flex items-center justify-between bg-white/40 dark:bg-slate-800/40 px-3 py-2 rounded-lg">
                                    <span className="text-xs font-semibold">持有股數</span>
                                    <input
                                        type="number"
                                        defaultValue={item.shares}
                                        onBlur={e => handleUpdateInvestment(item.id, e.target.value, item.currentPrice, item.averageBuyPrice)}
                                        className="w-24 px-2 py-1 text-right bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between bg-white/40 dark:bg-slate-800/40 px-3 py-2 rounded-lg">
                                    <span className="text-xs font-semibold">平均買入價</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-slate-500">{item.currency || "TWD"}</span>
                                        <input
                                            type="number"
                                            defaultValue={item.averageBuyPrice}
                                            onBlur={e => handleUpdateInvestment(item.id, item.shares, item.currentPrice, e.target.value)}
                                            className="w-24 px-2 py-1 text-right bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between bg-white/40 dark:bg-slate-800/40 px-3 py-2 rounded-lg">
                                    <span className="text-xs font-semibold">目前股價</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-slate-500">{item.currency || "TWD"}</span>
                                        <input
                                            type="number"
                                            defaultValue={item.currentPrice}
                                            onBlur={e => handleUpdateInvestment(item.id, item.shares, e.target.value, item.averageBuyPrice)}
                                            className="w-24 px-2 py-1 text-right bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                        {item.type === "STOCK" && (
                                            <button
                                                onClick={() => handleSyncPrice(item.id, item.symbol)}
                                                className="w-7 h-7 ml-1 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 flex items-center justify-center transition-colors"
                                                title="同步即時股價"
                                            >
                                                <RefreshCw size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {investments.length === 0 && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                        <TrendingUp className="w-12 h-12 mb-4 opacity-50" />
                        <p>尚未建立投資組合紀錄</p>
                    </div>
                )}
            </div>
        </div>
    );
}
