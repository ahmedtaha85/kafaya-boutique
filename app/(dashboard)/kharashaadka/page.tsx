"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DollarSign, PlusCircle, Loader2, Calendar, Tag } from "lucide-react";

type Expense = {
    id: string;
    title: string;
    category: string;
    amount: number;
    created_at: string;
};

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Rent");
    const [amount, setAmount] = useState("");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const supabase = createClient();

    useEffect(() => {
        async function loadExpenses() {
            try {
                const { data, error } = await supabase
                    .from("expenses")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (error) throw error;
                setExpenses(data || []);
            } catch (err: any) {
                console.error("Error fetching expenses:", err);
            } finally {
                setLoading(false);
            }
        }

        loadExpenses();
    }, [supabase]);

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);

        try {
            const { data, error } = await supabase
                .from("expenses")
                .insert([
                    {
                        title,
                        category,
                        amount: parseFloat(amount),
                        created_at: new Date().toISOString(),
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            if (data) setExpenses([data, ...expenses]);

            setTitle("");
            setAmount("");
            setMessage({ type: "success", text: "Expense recorded successfully!" });
        } catch (err: any) {
            setMessage({ type: "error", text: err.message || "Failed to add expense record." });
        } finally {
            setSubmitting(false);
        }
    };

    const totalExpenseSum = expenses.reduce((sum, item) => sum + item.amount, 0);

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Expenses Management
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Track utilities, rent, salaries, and operational costs.
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
                    <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Total Expenses
                        </div>
                        <div className="text-xl font-black text-rose-600">
                            ${totalExpenseSum.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>

            {message && (
                <div
                    className={`p-4 rounded-xl text-xs font-semibold ${message.type === "success"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                >
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form
                    onSubmit={handleAddExpense}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 h-fit"
                >
                    <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm pb-2 border-b border-slate-100 dark:border-slate-800">
                        <PlusCircle className="w-4 h-4 text-primary" /> Record New Expense
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Expense Title
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Monthly Electricity Bill"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                        >
                            <option value="Rent">Shop Rent</option>
                            <option value="Utilities">Utilities (Water, Power, Wifi)</option>
                            <option value="Salaries">Staff Salaries</option>
                            <option value="Logistics">Shipping & Cargo Logistics</option>
                            <option value="Other">Other Expenses</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Amount ($)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            placeholder="150.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-primary text-white font-medium rounded-xl text-sm hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Expense"}
                    </button>
                </form>

                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                        Recent Expense Transactions
                    </h3>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-400">
                            No expenses recorded yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {expenses.map((exp) => (
                                <div
                                    key={exp.id}
                                    className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs"
                                >
                                    <div className="space-y-1">
                                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                                            {exp.title}
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Tag className="w-3 h-3 text-primary" /> {exp.category}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(exp.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <span className="font-extrabold text-rose-600 text-base">
                                        -${exp.amount.toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}