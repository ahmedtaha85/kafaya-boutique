"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import Link from "next/link";

export default function EditProductPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const supabase = createClient();

    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProduct() {
            try {
                const { data, error } = await supabase
                    .from("products")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (error) throw error;
                if (data) {
                    setName(data.name || "");
                    setCategory(data.category || "");
                    setPrice(data.price?.toString() || "");
                    setStock(data.stock_quantity?.toString() || "");
                }
            } catch (err: any) {
                setErrorMsg(err.message || "Failed to load product details.");
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [id, supabase]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrorMsg(null);

        try {
            const { error } = await supabase
                .from("products")
                .update({
                    name,
                    category,
                    price: parseFloat(price),
                    stock_quantity: parseInt(stock, 10),
                })
                .eq("id", id);

            if (error) throw error;

            router.push("/alaabta");
            router.refresh();
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to update product.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        setSaving(true);
        try {
            const { error } = await supabase.from("products").delete().eq("id", id);
            if (error) throw error;

            router.push("/alaabta");
            router.refresh();
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to delete product.");
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/alaabta"
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Edit Product #{id}
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Update details or remove this product from inventory.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleDelete}
                    className="p-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold border border-rose-200 dark:border-rose-900"
                >
                    <Trash2 className="w-4 h-4" /> Delete
                </button>
            </div>

            {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-4 rounded-xl">
                    {errorMsg}
                </div>
            )}

            <form
                onSubmit={handleUpdate}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
            >
                <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Product Name
                    </label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Category
                        </label>
                        <input
                            type="text"
                            required
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Price ($)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Stock Quantity
                    </label>
                    <input
                        type="number"
                        required
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                    />
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 px-4 bg-primary text-white font-medium rounded-xl text-sm hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 mt-4"
                >
                    {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <>
                            <Save className="w-4 h-4" /> Save Changes
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}