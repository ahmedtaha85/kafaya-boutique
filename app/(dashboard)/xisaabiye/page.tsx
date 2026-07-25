"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    PieChart,
    Loader2,
    Receipt,
} from "lucide-react";

export default function AccountingPage() {
    const [totalSales, setTotalSales] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [salesCount, setSalesCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        async function loadFinancials() {
            try {
                const { data: sales } = await supabase.from("sales").select("total_amount");
                const { data: expenses } = await supabase.from("expenses").select("amount");

                const salesSum = sales?.reduce((sum, s) => sum + s.total_amount, 0) || 0;
                const expensesSum = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;

                setTotalSales(salesSum);
                setTotalExpenses(expensesSum);
                setSalesCount(sales?.length || 0);
            } catch (err) {
                console.error("Error loading financials:", err);
            } finally {
                setLoading(false);
            }
        }

        loadFinancials();
    }, [supabase]);

    const netProfit = totalSales - totalExpenses;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Financial & Accounting Summary
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Revenue, expense breakdown, and net profit performance.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Total Revenue
                        </span>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                        ${totalSales.toFixed(2)}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Total Expenses
                        </span>
                        <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                            <TrendingDown className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                        ${totalExpenses.toFixed(2)}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Net Profit
                        </span>
                        <div className="p-2 bg-primary/10 text-primary rounded-xl">
                            <DollarSign className="w-4 h-4" />
                        </div>
                    </div>
                    <div
                        className={`text-2xl font-black mt-2 ${netProfit >= 0 ? "text-emerald-600" : "text-rose-600"
                            }`}
                    >
                        ${netProfit.toFixed(2)}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Total Orders
                        </span>
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl">
                            <Receipt className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                        {salesCount} Sales
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm">
                    <PieChart className="w-4 h-4 text-primary" /> Profit & Loss Breakdown
                </div>

                <div className="space-y-4 pt-2">
                    <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                            <span>Gross Income</span>
                            <span className="text-emerald-600">${totalSales.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                            <div
                                className="bg-emerald-500 h-2.5 rounded-full"
                                style={{ width: "100%" }}
                            ></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                            <span>Operational Expense Impact</span>
                            <span className="text-rose-600">${totalExpenses.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                            <div
                                className="bg-rose-500 h-2.5 rounded-full"
                                style={{
                                    width: `${totalSales > 0 ? Math.min((totalExpenses / totalSales) * 100, 100) : 0
                                        }%`,
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}