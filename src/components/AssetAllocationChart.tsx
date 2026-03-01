"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { ArrowLeft } from "lucide-react";

const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#ec4899"];

type ChartEntry = {
    name: string;
    value: number;
    children?: { name: string; value: number }[];
};

export default function AssetAllocationChart({ data }: { data: ChartEntry[] }) {
    const [drillDown, setDrillDown] = useState<{ parentName: string; items: { name: string; value: number }[] } | null>(null);

    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-slate-400">
                目前沒有資產數據
            </div>
        );
    }

    const displayData = drillDown ? drillDown.items : data;
    const total = displayData.reduce((sum, d) => sum + d.value, 0);

    const handleClick = (entry: any, index: number) => {
        if (drillDown) return; // Already drilled down, do nothing
        // recharts passes the data item as first arg to onClick
        const clickedName = entry?.name;
        if (!clickedName) return;
        const original = data.find(d => d.name === clickedName);
        if (original?.children && original.children.length > 0) {
            setDrillDown({ parentName: original.name, items: original.children });
        }
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const item = payload[0];
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
            return (
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-xl p-3 shadow-lg border border-slate-200 dark:border-slate-700 text-sm">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-slate-600 dark:text-slate-300">{Number(item.value).toLocaleString()}</p>
                    <p className="text-indigo-600 dark:text-indigo-400 font-bold">{pct}%</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full">
            {drillDown && (
                <div className="flex items-center gap-2 mb-3">
                    <button
                        onClick={() => setDrillDown(null)}
                        className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors font-medium"
                    >
                        <ArrowLeft size={16} />
                        返回總覽
                    </button>
                    <span className="text-slate-400 dark:text-slate-500">›</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{drillDown.parentName}</span>
                </div>
            )}
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={displayData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={85}
                            paddingAngle={4}
                            dataKey="value"
                            onClick={handleClick}
                            style={{ cursor: drillDown ? "default" : "pointer" }}
                        >
                            {displayData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    stroke="transparent"
                                    className="hover:opacity-80 transition-opacity"
                                />
                            ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend
                            formatter={(value) => (
                                <span className="text-xs text-slate-700 dark:text-slate-300">{value}</span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            {!drillDown && (
                <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-1">點擊圓餅區塊可查看明細</p>
            )}
        </div>
    );
}
