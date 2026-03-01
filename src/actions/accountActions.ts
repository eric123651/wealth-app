"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAccounts() {
    return await prisma.account.findMany({
        orderBy: { type: "asc" },
    });
}

export async function createAccount(data: { name: string; type: string; currency?: string; balance?: number; monthlyPayment?: number }) {
    const account = await prisma.account.create({ data });
    revalidatePath("/");
    return account;
}

export async function updateAccountBalance(id: string, balance: number) {
    const account = await prisma.account.update({
        where: { id },
        data: { balance },
    });
    revalidatePath("/");
    return account;
}

export async function deleteAccount(id: string) {
    await prisma.account.delete({ where: { id } });
    revalidatePath("/");
}

export async function processMonthlyDeductions() {
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

    const liabilities = await prisma.account.findMany({
        where: {
            type: "LIABILITY",
            monthlyPayment: { gt: 0 },
        },
    });

    for (const liability of liabilities) {
        if (!liability.monthlyPayment) continue;
        if (liability.lastDeductedMonth === currentMonth) continue; // Already deducted

        const newBalance = Math.max(0, liability.balance - liability.monthlyPayment);
        await prisma.account.update({
            where: { id: liability.id },
            data: {
                balance: newBalance,
                lastDeductedMonth: currentMonth,
            },
        });
    }
    // No revalidatePath here - the dashboard page itself will read fresh data after this awaited call
}
