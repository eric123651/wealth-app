"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";

export async function getAccounts() {
    const user = await requireAuth();
    return await prisma.account.findMany({
        where: { userId: user.userId },
        orderBy: { type: "asc" },
    });
}

export async function createAccount(data: { name: string; type: string; currency: string; balance: number; monthlyPayment?: number }) {
    const user = await requireAuth();
    const account = await prisma.account.create({
        data: { ...data, userId: user.userId }
    });
    revalidatePath("/");
    return account;
}

export async function updateAccountBalance(id: string, balance: number) {
    const user = await requireAuth();

    // Verify ownership
    const existing = await prisma.account.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.userId) throw new Error("Unauthorized");

    const account = await prisma.account.update({
        where: { id },
        data: { balance },
    });
    revalidatePath("/");
    return account;
}

export async function deleteAccount(id: string) {
    const user = await requireAuth();
    await prisma.account.deleteMany({ where: { id, userId: user.userId } });
    revalidatePath("/");
}

export async function processMonthlyDeductions() {
    const user = await requireAuth();
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

    const liabilities = await prisma.account.findMany({
        where: {
            userId: user.userId,
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
}
