import { getAccounts, processMonthlyDeductions } from "@/actions/accountActions";
import { getInvestments } from "@/actions/investmentActions";
import AssetAllocationChart from "@/components/AssetAllocationChart";
import DashboardSummaryCards from "@/components/DashboardSummaryCards";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  // Auto-deduct monthly payments for liability accounts that haven't been deducted this month
  await processMonthlyDeductions();

  const accounts = await getAccounts();
  const investments = await getInvestments();

  // Grouping helper
  const groupByCurrency = (items: any[], valueMapper: (item: any) => number) => {
    return items.reduce((acc, item) => {
      const c = item.currency || "TWD";
      acc[c] = (acc[c] || 0) + valueMapper(item);
      return acc;
    }, {} as Record<string, number>);
  };

  const liquidAssetsByCurrency = groupByCurrency(accounts.filter(a => a.type === "LIQUID_ASSET"), a => a.balance);
  const fixedAssetsByCurrency = groupByCurrency(accounts.filter(a => a.type === "FIXED_ASSET"), a => a.balance);
  const liabilitiesByCurrency = groupByCurrency(accounts.filter(a => a.type === "LIABILITY"), a => a.balance);
  const investmentsByCurrency = groupByCurrency(investments, inv => inv.shares * inv.currentPrice);

  const allCurrencies = Array.from(new Set([
    ...Object.keys(liquidAssetsByCurrency),
    ...Object.keys(fixedAssetsByCurrency),
    ...Object.keys(liabilitiesByCurrency),
    ...Object.keys(investmentsByCurrency)
  ]));

  const totalsByCurrency = allCurrencies.map(c => {
    const liquid = liquidAssetsByCurrency[c] || 0;
    const fixed = fixedAssetsByCurrency[c] || 0;
    const inv = investmentsByCurrency[c] || 0;
    const liab = liabilitiesByCurrency[c] || 0;
    return {
      currency: c,
      assets: liquid + fixed + inv,
      liabilities: liab,
      netWorth: (liquid + fixed + inv) - liab,
      investments: inv
    };
  });

  const chartData = [
    ...Object.entries(liquidAssetsByCurrency).map(([c, v]) => ({
      name: `流動資產 (${c})`,
      value: v as number,
      children: accounts
        .filter(a => a.type === "LIQUID_ASSET" && (a.currency || "TWD") === c)
        .map(a => ({ name: a.name, value: a.balance }))
    })),
    ...Object.entries(fixedAssetsByCurrency).map(([c, v]) => ({
      name: `固定資產 (${c})`,
      value: v as number,
      children: accounts
        .filter(a => a.type === "FIXED_ASSET" && (a.currency || "TWD") === c)
        .map(a => ({ name: a.name, value: a.balance }))
    })),
    ...Object.entries(investmentsByCurrency).map(([c, v]) => ({
      name: `投資組合 (${c})`,
      value: v as number,
      children: investments
        .filter(inv => (inv.currency || "USD") === c)
        .map(inv => ({ name: inv.name, value: inv.shares * inv.currentPrice }))
    })),
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-0">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">資產總覽</h1>
        <p className="text-slate-600 dark:text-slate-300 mt-1">歡迎回來，這是您目前的財務狀況。</p>
      </header>

      <DashboardSummaryCards totals={totalsByCurrency} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">資產分佈</h3>
          <AssetAllocationChart data={chartData} />
        </div>

        <div className="glass rounded-2xl p-6 flex flex-col justify-center items-center text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
            <span className="text-2xl">🌱</span>
          </div>
          <h3 className="text-lg font-semibold">讓AI幫您記帳</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            切換到「AI記帳」分頁，輸入對話即可自動記錄您的收支。
          </p>
        </div>
      </div>
    </div >
  );
}
