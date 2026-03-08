"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";

// V1.0.1 - Fixed Transaction Types for Supabase
export async function getTransactions() {
    const user = await requireAuth();
    return await prisma.transaction.findMany({
        where: { userId: user.userId },
        orderBy: { date: "desc" },
        include: { account: true },
    });
}

export async function createTransaction(data: {
    amount: number;
    type: string;
    accountId: string;
    category?: string;
    note?: string;
    date?: Date;
    currency: string;
    description?: string;
}) {
    const user = await requireAuth();

    // Verify account ownership
    const account = await prisma.account.findUnique({ where: { id: data.accountId } });
    if (!account || account.userId !== user.userId) throw new Error("Unauthorized account access");

    const transaction = await prisma.transaction.create({
        data: {
            userId: user.userId,
            amount: data.amount,
            type: data.type,
            accountId: data.accountId,
            category: data.category,
            note: data.note,
            currency: data.currency,
            description: data.description || "",
            date: data.date || new Date(),
        }
    });

    // Update account balance automatically
    const multiplier = data.type === "INCOME" ? 1 : -1;
    await prisma.account.update({
        where: { id: data.accountId },
        data: { balance: account.balance + (data.amount * multiplier) }
    });

    revalidatePath("/");
    return transaction;
}

export async function deleteTransaction(id: string) {
    const user = await requireAuth();
    const transaction = await prisma.transaction.findUnique({ where: { id } });

    if (transaction && transaction.userId === user.userId) {
        const account = await prisma.account.findUnique({ where: { id: transaction.accountId } });
        if (account) {
            const multiplier = transaction.type === "INCOME" ? -1 : 1; // Reverse the effect
            await prisma.account.update({
                where: { id: transaction.accountId },
                data: { balance: account.balance + (transaction.amount * multiplier) }
            });
        }
        await prisma.transaction.delete({ where: { id } });
    }
    revalidatePath("/");
}
