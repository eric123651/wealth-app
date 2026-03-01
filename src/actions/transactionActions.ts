"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTransactions() {
    return await prisma.transaction.findMany({
        orderBy: { date: "desc" },
        include: { account: true },
    });
}



// Update account balance automatically
const account = await prisma.account.findUnique({ where: { id: data.accountId } });
if (account) {
    const multiplier = data.type === "INCOME" ? 1 : -1;
    await prisma.account.update({
        where: { id: data.accountId },
        data: { balance: account.balance + (data.amount * multiplier) }
    });
}

revalidatePath("/");
return transaction;
}

export async function deleteTransaction(id: string) {
    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (transaction) {
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
