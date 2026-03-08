"use client";

import { useState, useEffect } from "react";
import { Plus, X, Tag } from "lucide-react";

export default function QuickTags({ onSelect, dynamicTags = [] }: { onSelect: (tag: string) => void, dynamicTags?: string[] }) {
    const [tags, setTags] = useState<string[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [newTag, setNewTag] = useState("");

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem("wealth_app_quick_tags");
        if (saved) {
            try {
                setTags(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse quick tags", e);
            }
        } else {
            // Default tags
            setTags(["午餐 150", "備用 500"]);
        }
    }, []);

    // Save to local storage whenever tags change
    useEffect(() => {
        if (tags.length > 0) {
            localStorage.setItem("wealth_app_quick_tags", JSON.stringify(tags));
        }
    }, [tags]);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTag.trim() || tags.includes(newTag.trim())) return;
        setTags(prev => [...prev, newTag.trim()]);
        setNewTag("");
        setIsEditing(false);
    };

    const handleRemove = (e: React.MouseEvent, tagToRemove: string) => {
        e.stopPropagation(); // Prevent triggering onSelect
        setTags(prev => prev.filter(t => t !== tagToRemove));
    };

    return (
        <div className="w-full flex items-center justify-start gap-2 flex-wrap mb-2 px-1">
            <Tag className="w-4 h-4 text-slate-400 shrink-0 mr-1" />

            {/* Dynamic Tags (e.g. Liabilities) */}
            {dynamicTags.map(tag => (
                <button
                    key={tag}
                    type="button"
                    onClick={() => onSelect(tag)}
                    className="group relative px-3 py-1 bg-rose-50 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-700/50 hover:border-rose-400 dark:hover:border-rose-500 rounded-full text-sm text-rose-700 dark:text-rose-300 transition-all flex items-center"
                    title="系統自動產生"
                >
                    {tag}
                </button>
            ))}

            {/* User Tags */}
            {tags.map(tag => (
                <button
                    key={tag}
                    type="button"
                    onClick={() => onSelect(tag)}
                    className="group relative px-3 py-1 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-full text-sm text-slate-700 dark:text-slate-300 transition-all flex items-center"
                >
                    {tag}
                    <div
                        onClick={(e) => handleRemove(e, tag)}
                        className="ml-1 -mr-1 w-4 h-4 rounded-full hover:bg-rose-100 hover:text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-slate-400"
                    >
                        <X size={12} />
                    </div>
                </button>
            ))}

            {isEditing ? (
                <form onSubmit={handleAdd} className="flex items-center">
                    <input
                        type="text"
                        autoFocus
                        value={newTag}
                        onChange={e => setNewTag(e.target.value)}
                        onBlur={() => {
                            if (!newTag.trim()) setIsEditing(false);
                        }}
                        placeholder="例如: 房租 15000"
                        className="px-3 py-1 text-sm rounded-full border border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-32 bg-white dark:bg-slate-900"
                    />
                </form>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-7 h-7 rounded-full border border-dashed border-slate-400 text-slate-500 hover:text-indigo-600 hover:border-indigo-600 flex items-center justify-center transition-colors"
                    title="新增常用按鈕"
                >
                    <Plus size={14} />
                </button>
            )}
        </div>
    );
}
