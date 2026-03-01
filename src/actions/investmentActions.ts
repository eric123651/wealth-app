"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import yahooFinance from "yahoo-finance2";

export async function getInvestments() {
    return await prisma.investment.findMany({
        orderBy: { name: "asc" },
    });
}

export async function createInvestment(data: { symbol: string; name: string; type: string; shares: number; averageBuyPrice: number; currentPrice: number; currency?: string }) {
    const inv = await prisma.investment.create({ data });
    revalidatePath("/");
    return inv;
}

export async function updateInvestmentPrice(id: string, currentPrice: number) {
    const inv = await prisma.investment.update({
        where: { id },
        data: { currentPrice },
    });
    revalidatePath("/");
    return inv;
}

export async function updateInvestmentDetails(id: string, shares: number, currentPrice: number) {
    const inv = await prisma.investment.update({
        where: { id },
        data: { shares, currentPrice },
    });
    revalidatePath("/");
    return inv;
}

export async function syncMarketPrice(id: string, symbol: string) {
    try {
        const quote = await yahooFinance.quote(symbol) as any;
        const price = quote.regularMarketPrice;

        if (price) {
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
    await prisma.investment.delete({ where: { id } });
    revalidatePath("/");
}
