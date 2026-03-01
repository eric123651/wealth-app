"use client";

import { useState, useEffect, useRef } from "react";
import { parseAndSaveChatMessage } from "@/actions/chatActions";
import { getTransactions, deleteTransaction } from "@/actions/transactionActions";
import { Send, Bot, User, Trash2, ArrowRightLeft } from "lucide-react";
import QuickTags from "@/components/QuickTags";

type Message = { id: string; role: "user" | "bot"; text: string };

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        { id: "msg-1", role: "bot", text: "您好！請告訴我您的收支狀況。例如：「買午餐 150」、「收到薪水 50000」。" }
    ]);
    const [input, setInput] = useState("");
    const [typeHint, setTypeHint] = useState<"AUTO" | "EXPENSE" | "INCOME">("AUTO");
    const [currency, setCurrency] = useState("TWD");
    const [isLoading, setIsLoading] = useState(false);
    const [transactions, setTransactions] = useState<any[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadTransactions();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const loadTransactions = async () => {
        const data = await getTransactions();
        setTransactions(data);
    };

    const handleDelete = async (id: string) => {
        await deleteTransaction(id);
        loadTransactions();
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { id: Date.now().toString(), role: "user", text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        const result = await parseAndSaveChatMessage(userMessage.text, typeHint, currency);

        setMessages(prev => [...prev, { id: Date.now().toString() + "-ai", role: "bot", text: result.message }]);
        setIsLoading(false);

        if (result.success) {
            loadTransactions();
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-0 h-[calc(100vh-8rem)]">

            {/* Chat Section */}
            <div className="lg:col-span-2 glass rounded-2xl flex flex-col h-[600px] lg:h-full relative overflow-hidden">
                <header className="p-6 border-b border-indigo-100 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Bot className="w-6 h-6 text-indigo-500" /> AI 記帳助手
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">口語化輸入，自動辨識分類與金額。</p>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex items-start gap-3 w-full ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"}`}>
                                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                            </div>
                            <div className={`p-4 rounded-2xl max-w-[75%] ${msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-white/70 dark:bg-slate-800/70 border rounded-tl-sm shadow-sm"}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3 w-full">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                <Bot size={16} />
                            </div>
                            <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border rounded-tl-sm flex gap-1">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="px-4 pt-2">
                    <QuickTags onSelect={(tagText) => setInput(tagText)} />
                </div>

                <form onSubmit={handleSend} className="p-4 border-t border-indigo-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex flex-col gap-3">
                    <div className="flex gap-2 px-1 items-center justify-between">
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setTypeHint("AUTO")} className={`px-4 py-1 text-sm rounded-full transition-colors ${typeHint === "AUTO" ? "bg-indigo-600 text-white font-medium" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700"}`}>自動判別</button>
                            <button type="button" onClick={() => setTypeHint("EXPENSE")} className={`px-4 py-1 text-sm rounded-full transition-colors ${typeHint === "EXPENSE" ? "bg-rose-500 text-white font-medium shadow-sm shadow-rose-500/30" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700"}`}>支出</button>
                            <button type="button" onClick={() => setTypeHint("INCOME")} className={`px-4 py-1 text-sm rounded-full transition-colors ${typeHint === "INCOME" ? "bg-emerald-500 text-white font-medium shadow-sm shadow-emerald-500/30" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700"}`}>收入</button>
                        </div>
                        <select
                            value={currency}
                            onChange={e => setCurrency(e.target.value)}
                            className="px-3 py-1 text-sm rounded-lg border bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="TWD">TWD</option>
                            <option value="USD">USD</option>
                            <option value="CNY">CNY</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="輸入消費或收入..."
                            className="flex-1 px-4 py-3 rounded-xl border bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-shadow"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>

            {/* Recent Transactions Tracker */}
            <div className="glass rounded-2xl h-[400px] lg:h-full flex flex-col p-6 overflow-hidden">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <ArrowRightLeft className="w-5 h-5" /> 近期歷史紀錄
                </h3>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {Object.entries(
                        transactions.reduce((acc, tx) => {
                            const date = new Date(tx.date).toLocaleDateString();
                            if (!acc[date]) acc[date] = [];
                            acc[date].push(tx);
                            return acc;
                        }, {} as Record<string, any[]>)
                    ).map(([date, dayTransactions]: [string, any]) => (
                        <div key={date} className="space-y-3">
                            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-1">{date}</h3>
                            {dayTransactions.map((tx: any) => (
                                <div key={tx.id} className="p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 border flex justify-between items-center group">
                                    <div>
                                        <p className="font-semibold text-sm">{tx.category || "未分類"}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{tx.account?.name || "預設錢包"} • {tx.note?.replace("原始訊息: ", "") || ""}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`font-bold ${tx.type === "INCOME" ? "text-emerald-500" : "text-slate-800 dark:text-slate-200"}`}>
                                            {tx.type === "INCOME" ? "+" : "-"} {tx.currency || "TWD"} {tx.amount.toLocaleString()}
                                        </span>
                                        <button onClick={() => handleDelete(tx.id)} className="text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}

                    {transactions.length === 0 && (
                        <div className="text-center text-slate-500 dark:text-slate-400 py-10">
                            尚無紀錄
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
