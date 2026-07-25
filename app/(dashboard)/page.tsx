"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
    DollarSign,
    Package,
    AlertTriangle,
    TrendingUp,
    ShoppingCart,
    PlusCircle,
    ArrowDownToLine,
    Receipt,
    BarChart2,
    Loader2,
    ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
    const [todaySales, setTodaySales] = useState<number>(0);
    const [totalProducts, setTotalProducts] = useState<number>(0);
    const [lowStockCount, setLowStockCount] = useState<number>(0);
    const [monthlySales, setMonthlySales] = useState<number>(0);
    const [recentSales, setRecentSales] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const supabase = createClient();

    useEffect(() => {
        async function fetchDashboardMetrics() {
            try {
                setLoading(true);
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);

                const monthStart = new Date();
                monthStart.setDate(1);
                monthStart.setHours(0, 0, 0, 0);

                // 1. Today's Sales
                const { data: todayData } = await supabase
                    .from("sales")
                    .select("total_amount")
                    .gte("created_at", todayStart.toISOString());

                const todaySum = todayData?.reduce((sum, s) => sum + Number(s.total_amount), 0) || 0;
                setTodaySales(todaySum);

                // 2. Total Products & Stock
                const { data: productsData } = await supabase
                    .from("products")
                    .select("stock_quantity");

                const totalItems = productsData?.reduce((sum, p) => sum + Number(p.stock_quantity), 0) || 0;
                setTotalProducts(totalItems);

                // 3. Low Stock Items (Stock <= 5)
                const lowStock = productsData?.filter((p) => p.stock_quantity <= 5).length || 0;
                setLowStockCount(lowStock);

                // 4. Monthly Total Sales
                const { data: monthData } = await supabase
                    .from("sales")
                    .select("total_amount")
                    .gte("created_at", monthStart.toISOString());

                const monthSum = monthData?.reduce((sum, s) => sum + Number(s.total_amount), 0) || 0;
                setMonthlySales(monthSum);

                // 5. Recent Transactions
                const { data: recent } = await supabase
                    .from("sales")
                    .select("*")
                    .order("created_at", { ascending: false })
                    .limit(5);

                setRecentSales(recent || []);
            } catch (error) {
                console.error("Error fetching dashboard analytics:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardMetrics();
    }, [supabase]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* BRAND PRIMARY WELCOME BANNER (HARD-LINKED TO PRIMARY COLOR) */}
            <div
                style={{ backgroundColor: "var(--primary, #510C21)" }}
                className="text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl relative overflow-hidden"
            >
                {/* Ambient Glow */}
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10">
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                        Welcome back, Kafaya Boutique 👋
                    </h1>
                    <p className="text-xs md:text-sm text-white/80 mt-1">
                        Here is your live real-time store performance and sales activity summary.
                    </p>
                </div>

                <Link
                    href="/iibi"
                    style={{ color: "var(--primary, #510C21)" }}
                    className="relative z-10 px-5 py-3 bg-white font-extrabold rounded-xl text-xs md:text-sm hover:bg-slate-100 transition flex items-center gap-2 shadow-lg shrink-0"
                >
                    <ShoppingCart className="w-4 h-4" /> Open POS Terminal
                </Link>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Today's Revenue
                        </span>
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
                            <DollarSign className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                        ${todaySales.toFixed(2)}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Live POS total for today</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Total Units in Stock
                        </span>
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
                            <Package className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                        {totalProducts} Items
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Available shop inventory</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Low Stock Alerts
                        </span>
                        <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl">
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                        {lowStockCount} Items
                    </div>
                    <p className="text-[11px] text-amber-600 font-medium mt-1">
                        {lowStockCount > 0 ? "Action required (Stock <= 5)" : "Stock levels healthy"}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Monthly Revenue
                        </span>
                        <div className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 rounded-xl">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                        ${monthlySales.toFixed(2)}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Current month gross total</p>
                </div>
            </div>

            {/* Main Grid Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4" style={{ color: "var(--primary, #510C21)" }} /> Recent Transactions
                        </h2>
                        <Link
                            href="/ganacsi"
                            style={{ color: "var(--primary, #510C21)" }}
                            className="text-xs font-semibold hover:underline flex items-center gap-1"
                        >
                            View All <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {recentSales.length === 0 ? (
                        <div className="text-center py-10 text-xs text-slate-400">
                            No recent sales recorded.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentSales.map((sale) => (
                                <div
                                    key={sale.id}
                                    className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs"
                                >
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">
                                            Order #{sale.id.slice(0, 8)}
                                        </div>
                                        <div className="text-[11px] text-slate-400 mt-0.5">
                                            {new Date(sale.created_at).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                            {" • "}
                                            <span className="uppercase font-semibold" style={{ color: "var(--primary, #510C21)" }}>
                                                {sale.payment_method}
                                            </span>
                                        </div>
                                    </div>

                                    <span className="font-black text-slate-900 dark:text-white text-sm">
                                        +${Number(sale.total_amount).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                    <h2 className="font-bold text-slate-900 dark:text-white text-base">
                        Quick Actions
                    </h2>

                    <div className="space-y-2.5">
                        <Link
                            href="/alaabta/new"
                            className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl flex items-center justify-between transition group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: "rgba(81, 12, 33, 0.1)", color: "var(--primary, #510C21)" }}>
                                    <PlusCircle className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                                        Add New Product
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                        Create new inventory item
                                    </div>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
                        </Link>

                        <Link
                            href="/soogasho"
                            className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl flex items-center justify-between transition group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <ArrowDownToLine className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                                        Restock Inventory
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                        Add dozens or custom stock
                                    </div>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
                        </Link>

                        <Link
                            href="/kharashaadka"
                            className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl flex items-center justify-between transition group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                                    <Receipt className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                                        Record Expense
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                        Track shop operational costs
                                    </div>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
                        </Link>

                        <Link
                            href="/xisaabiye"
                            className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl flex items-center justify-between transition group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <BarChart2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                                        Financial Reports
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                        Review profit and margins
                                    </div>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}