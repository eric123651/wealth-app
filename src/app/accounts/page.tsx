"use client";

import { useState, useEffect } from "react";
import { getAccounts, createAccount, deleteAccount } from "@/actions/accountActions";
import { Plus, Trash2, Wallet2, Building } from "lucide-react";

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [name, setName] = useState("");
    const [type, setType] = useState("LIQUID_ASSET");
    const [currency, setCurrency] = useState("TWD");
    const [balance, setBalance] = useState("");
    const [monthlyPayment, setMonthlyPayment] = useState("");

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        const data = await getAccounts();
        setAccounts(data);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !balance) return;
        await createAccount({
            name,
            type,
            currency,
            balance: parseFloat(balance),
            ...(type === "LIABILITY" && monthlyPayment ? { monthlyPayment: parseFloat(monthlyPayment) } : {}),
        });
        setName("");
        setBalance("");
        setMonthlyPayment("");
        loadAccounts();
    };

    const handleDelete = async (id: string) => {
        await deleteAccount(id);
        loadAccounts();
    };

    const liquidAssets = accounts.filter(a => a.type === "LIQUID_ASSET");
    const fixedAssets = accounts.filter(a => a.type === "FIXED_ASSET");
    const liabilities = accounts.filter(a => a.type === "LIABILITY");

    const Section = ({ title, items, icon: Icon, colorClass }: any) => (
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
                <Icon className={`w-6 h-6 ${colorClass}`} />
                <h2 className="text-xl font-bold">{title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item: any) => (
                    <div key={item.id} className="glass rounded-xl p-5 flex justify-between items-start card-hover">
                        <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className={`text-xl font-bold mt-1 ${colorClass}`}>
                                {item.currency} {item.balance.toLocaleString()}
                            </p>
                            {item.monthlyPayment && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">每月還款：{item.currency} {item.monthlyPayment.toLocaleString()}</p>
                            )}
                        </div>
                        <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white/50 dark:bg-slate-800/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                {items.length === 0 && (
                    <div className="col-span-full py-8 text-center text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                        此分類暫無帳戶
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-0">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">資產與負債管理</h1>
                <p className="text-slate-600 dark:text-slate-300 mt-1">手動新增或移除您的各大銀行帳戶與負債。</p>
            </header>

            <form onSubmit={handleCreate} className="glass p-6 rounded-2xl flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:w-1/3">
                    <label className="block text-sm font-medium mb-1">帳戶名稱</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="例如：台幣國泰"
                        className="w-full px-4 py-2 rounded-lg border bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                    />
                </div>
                <div className="w-full md:w-1/4">
                    <label className="block text-sm font-medium mb-1">類別</label>
                    <select
                        value={type}
                        onChange={e => setType(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                    >
                        <option value="LIQUID_ASSET">流動資產</option>
                        <option value="FIXED_ASSET">固定資產</option>
                        <option value="LIABILITY">負債</option>
                    </select>
                </div>
                <div className="w-full md:w-1/4">
                    <label className="block text-sm font-medium mb-1">幣別</label>
                    <select
                        value={currency}
                        onChange={e => setCurrency(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                    >
                        <option value="TWD">TWD</option>
                        <option value="USD">USD</option>
                        <option value="CNY">CNY</option>
                    </select>
                </div>
                <div className="w-full md:w-1/3">
                    <label className="block text-sm font-medium mb-1">初始金額</label>
                    <input
                        type="number"
                        required
                        value={balance}
                        onChange={e => setBalance(e.target.value)}
                        placeholder="0"
                        className="w-full px-4 py-2 rounded-lg border bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                    />
                </div>
                {type === "LIABILITY" && (
                    <div className="w-full md:w-1/3">
                        <label className="block text-sm font-medium mb-1">每月還款金額 (選填)</label>
                        <input
                            type="number"
                            value={monthlyPayment}
                            onChange={e => setMonthlyPayment(e.target.value)}
                            placeholder="0"
                            className="w-full px-4 py-2 rounded-lg border bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                        />
                    </div>
                )}
                <button
                    type="submit"
                    className="w-full md:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center justify-center transition-colors h-[42px]"
                >
                    <Plus className="w-5 h-5 mr-1" /> 新增
                </button>
            </form>

            <div className="mt-8 space-y-12">
                <Section title="流動資產" items={liquidAssets} icon={Wallet2} colorClass="text-emerald-500" />
                <Section title="大型固定資產" items={fixedAssets} icon={Building} colorClass="text-indigo-500" />
                <Section title="負債" items={liabilities} icon={Wallet2} colorClass="text-rose-500" />
            </div>
        </div>
    );
}
