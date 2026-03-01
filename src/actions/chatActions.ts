"use server";
import { createTransaction } from "./transactionActions";
import { prisma } from "@/lib/prisma";

export async function parseAndSaveChatMessage(message: string, typeHint: "AUTO" | "EXPENSE" | "INCOME" = "AUTO", currencyHint: string = "TWD") {
    // Very basic regex: looking for an optional category then numbers
    // e.g., "晚餐 150", "買飲料100", "薪水 +50000"

    // Try to find numbers
    const amountMatch = message.match(/[\d,.]+/);
    if (!amountMatch) {
        return { success: false, message: "❌ 找不到金額，請重新輸入（例如：午餐 100）" };
    }

    const amountStr = amountMatch[0].replace(/,/g, '');
    let amount = parseFloat(amountStr);

    // Try to find if it's income or expense
    // default to expense, income if explicitly has + or keywords
    let type = "EXPENSE";
    if (typeHint && typeHint !== "AUTO") {
        type = typeHint;
    } else if (message.includes("+") || message.includes("收") || message.includes("入") || message.includes("薪水")) {
        type = "INCOME";
    }

    // Find category (everything except the amount and some fluff)
    let category = message.replace(amountMatch[0], '')
        .replace(/[+買花]/g, '')
        .trim();
    if (!category) {
        category = "未分類";
    }

    // Find a default account matching the currency (or just pick the first liquid asset)
    let defaultAccount = await prisma.account.findFirst({
        where: { type: "LIQUID_ASSET", currency: currencyHint }
    });

    if (!defaultAccount) {
        defaultAccount = await prisma.account.findFirst({
            where: { type: "LIQUID_ASSET" }
        });
    }

    // If no account exists, create a dummy one
    if (!defaultAccount) {
        defaultAccount = await prisma.account.create({
            data: { name: "預設錢包", type: "LIQUID_ASSET", currency: currencyHint, balance: 0 }
        });
    }

    try {
        await createTransaction({
            amount,
            type,
            category,
            accountId: defaultAccount.id,
            currency: currencyHint,
            note: `原始訊息: ${message}`
        });
        return { success: true, message: `✅ 已記錄：${type === "INCOME" ? "收入" : "支出"} ${currencyHint} ${amount} (${category})` };
    } catch (error: any) {
        console.error("Save error:", error);
        return { success: false, message: `❌ 記錄失敗：${error.message}` };
    }
}
