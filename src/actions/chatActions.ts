"use server";
import { createTransaction } from "./transactionActions";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function parseAndSaveChatMessage(message: string, typeHint: "AUTO" | "EXPENSE" | "INCOME" = "AUTO", currencyHint: string = "TWD") {
    const user = await requireAuth();

    // Improved number extraction: look for numbers with optional units (元, 塊, $) next to it
    // Or just grab the last number in the string if no unit is found
    const matchesWithUnits = message.match(/(?:[\$])?\s*([\d,.]+)\s*(?:元|塊)/);
    let amountStr = "";
    let matchedStr = "";

    if (matchesWithUnits) {
        amountStr = matchesWithUnits[1];
        matchedStr = matchesWithUnits[0];
    } else {
        const allNumbers = message.match(/[\d,.]+/g);
        if (allNumbers && allNumbers.length > 0) {
            // Pick the last number as the amount, e.g., "買50嵐 100" -> 100
            amountStr = allNumbers[allNumbers.length - 1];
            matchedStr = amountStr;
        } else {
            return { success: false, message: "❌ 找不到金額，請重新輸入（例如：買50嵐 100塊）" };
        }
    }

    const amount = parseFloat(amountStr.replace(/,/g, ''));

    let type = "EXPENSE";
    if (typeHint && typeHint !== "AUTO") {
        type = typeHint;
    } else if (message.includes("+") || message.includes("收") || message.includes("入") || message.includes("薪水")) {
        type = "INCOME";
    }

    // Isolate the category text by removing the matched amount part and some noise characters
    let category = message.replace(matchedStr, '')
        .replace(/[+買花]/g, '')
        .trim();

    if (!category || /^\d+$/.test(category)) {
        category = "未分類";
    }

    let targetAccount = null;

    // Check if the message is paying a liability
    if (type === "EXPENSE") {
        const liabilities = await prisma.account.findMany({
            where: { userId: user.userId, type: "LIABILITY" }
        });

        // Match liability name in the message
        const matchedLiability = liabilities.find(l => message.includes(l.name));

        if (matchedLiability) {
            targetAccount = matchedLiability;
            category = `繳納${matchedLiability.name}`;
            // Currency will match the liability's currency
            currencyHint = matchedLiability.currency || currencyHint;
        }
    }

    if (!targetAccount) {
        targetAccount = await prisma.account.findFirst({
            where: { userId: user.userId, type: "LIQUID_ASSET", currency: currencyHint }
        });
    }

    if (!targetAccount) {
        targetAccount = await prisma.account.findFirst({
            where: { userId: user.userId, type: "LIQUID_ASSET" }
        });
    }

    if (!targetAccount) {
        targetAccount = await prisma.account.create({
            data: { userId: user.userId, name: "預設錢包", type: "LIQUID_ASSET", currency: currencyHint, balance: 0 }
        });
    }

    try {
        await createTransaction({
            amount,
            type,
            category,
            accountId: targetAccount.id,
            currency: currencyHint,
            note: `原始訊息: ${message}`
        });
        return { success: true, message: `✅ 已記錄：${type === "INCOME" ? "收入" : "支出"} ${currencyHint} ${amount} (${category})` };
    } catch (error: any) {
        console.error("Save error:", error);
        return { success: false, message: `❌ 記錄失敗：${error.message}` };
    }
}
