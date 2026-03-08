"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import yahooFinance from "yahoo-finance2";
import { requireAuth } from "@/lib/auth";

export async function getInvestments() {
    const user = await requireAuth();
    return await prisma.investment.findMany({
        where: { userId: user.userId },
        orderBy: { name: "asc" },
    });
}

export async function createInvestment(data: { symbol: string; name: string; type: string; shares: number; averageBuyPrice: number; currentPrice: number; currency: string; category?: string }) {
    const user = await requireAuth();
    const inv = await prisma.investment.create({
        data: {
            ...data,
            userId: user.userId,
            category: data.category || "Liquid Assets"
        }
    });
    revalidatePath("/");
    return inv;
}

export async function updateInvestmentPrice(id: string, currentPrice: number) {
    const user = await requireAuth();
    const existing = await prisma.investment.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.userId) throw new Error("Unauthorized");

    const inv = await prisma.investment.update({
        where: { id },
        data: { currentPrice },
    });
    revalidatePath("/");
    return inv;
}

export async function updateInvestmentDetails(id: string, shares: number, currentPrice: number, averageBuyPrice?: number) {
    const user = await requireAuth();
    const existing = await prisma.investment.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.userId) throw new Error("Unauthorized");

    const data: any = { shares, currentPrice };
    if (averageBuyPrice !== undefined) data.averageBuyPrice = averageBuyPrice;

    const inv = await prisma.investment.update({
        where: { id },
        data,
    });
    revalidatePath("/");
    return inv;
}

export async function syncMarketPrice(id: string, symbol: string) {
    const user = await requireAuth();
    try {
        const quote = await yahooFinance.quote(symbol) as any;
        const price = quote.regularMarketPrice;

        if (price) {
            const existing = await prisma.investment.findUnique({ where: { id } });
            if (!existing || existing.userId !== user.userId) throw new Error("Unauthorized");

            const inv = await prisma.investment.update({
                where: { id },
                data: { currentPrice: price },
            });
            revalidatePath("/");
            return { success: true, data: inv };
        }
        return { success: false, error: "Price not found" };
    } catch (error: any) {
        console.error("Failed to sync market price:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteInvestment(id: string) {
    const user = await requireAuth();
    await prisma.investment.deleteMany({ where: { id, userId: user.userId } });
    revalidatePath("/");
}
