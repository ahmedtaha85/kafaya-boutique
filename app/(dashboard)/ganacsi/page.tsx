"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { BarChart3, ShoppingBag, Loader2, Calendar } from "lucide-react";

type SaleRecord = {
    id: string;
    total_amount: number;
    payment_method: string;
    created_at: string;
};

export default function BusinessAnalyticsPage() {
    const [sales, setSales] = useState<SaleRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        async function loadSalesHistory() {
            try {
                const { data, error } = await supabase
                    .from("sales")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (error) throw error;
                setSales(data || []);
            } catch (err) {
                console.error("Error fetching sales history:", err);
            } finally {
                setLoading(false);
            }
        }

        loadSalesHistory();
    }, [supabase]);

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Business & Sales Analytics
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Historical transactions and sales channel metrics.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm">
                        <BarChart3 className="w-4 h-4 text-primary" /> Sales Transaction History
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                        Total Transactions: {sales.length}
                    </span>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : sales.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                        No sales recorded yet.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {sales.map((sale) => (
                            <div
                                key={sale.id}
                                className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                        <ShoppingBag className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">
                                            Order #{sale.id.slice(0, 8)}
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                            <span className="uppercase font-semibold text-primary">
                                                {sale.payment_method}
                                            </span>
                                            •
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(sale.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span className="font-black text-slate-900 dark:text-white text-sm">
                                        ${sale.total_amount.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}