"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { PlusCircle, Loader2, Info } from "lucide-react";

type Product = {
    id: string;
    name: string;
    stock_quantity: number;
};

export default function RestockPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string>("");
    const [unitType, setUnitType] = useState<"darsan" | "daaqad" | "custom">("darsan");
    const [quantity, setQuantity] = useState<number>(1);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const supabase = createClient();

    useEffect(() => {
        async function loadProducts() {
            try {
                const { data, error } = await supabase
                    .from("products")
                    .select("id, name, stock_quantity")
                    .order("name", { ascending: true });

                if (error) throw error;

                if (data && data.length > 0) {
                    setProducts(data);
                    setSelectedProduct(data[0].id);
                }
            } catch (err: any) {
                setMessage({ type: "error", text: err.message || "Failed to load product list." });
            } finally {
                setFetching(false);
            }
        }

        loadProducts();
    }, [supabase]);

    const calculateAddedPieces = () => {
        if (unitType === "darsan") return quantity * 12;
        if (unitType === "daaqad") return quantity * 6;
        return quantity;
    };

    const handleRestock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;

        setLoading(true);
        setMessage(null);

        const addedCount = calculateAddedPieces();
        const currentProd = products.find((p) => p.id === selectedProduct);
        const newStock = (currentProd?.stock_quantity || 0) + addedCount;

        try {
            const { error: updateError } = await supabase
                .from("products")
                .update({ stock_quantity: newStock })
                .eq("id", selectedProduct);

            if (updateError) throw updateError;

            await supabase.from("stock_logs").insert([
                {
                    product_id: selectedProduct,
                    unit_type: unitType,
                    quantity_entered: quantity,
                    total_pieces_added: addedCount,
                },
            ]);

            setProducts((prev) =>
                prev.map((p) => (p.id === selectedProduct ? { ...p, stock_quantity: newStock } : p))
            );

            setMessage({
                type: "success",
                text: `Successfully added +${addedCount} pieces to ${currentProd?.name}!`,
            });
            setQuantity(1);
        } catch (err: any) {
            setMessage({
                type: "error",
                text: err.message || "An error occurred while updating the inventory.",
            });
        } finally {
            setLoading(false);
        }
    };

    const currentItem = products.find((p) => p.id === selectedProduct);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Stock Entry & Restock
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Increase store inventory using Dozens (12 pcs), Packs (6 pcs), or individual items.
                </p>
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
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6 font-semibold text-slate-800 dark:text-white text-sm">
                        <PlusCircle className="w-5 h-5 text-primary" />
                        Restock Form
                    </div>

                    {fetching ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : (
                        <form onSubmit={handleRestock} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Select Product
                                </label>
                                <select
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                                >
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} (Current Stock: {p.stock_quantity} pcs)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Unit Type
                                    </label>
                                    <select
                                        value={unitType}
                                        onChange={(e) =>
                                            setUnitType(e.target.value as "darsan" | "daaqad" | "custom")
                                        }
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                                    >
                                        <option value="darsan">Dozen (12 pcs)</option>
                                        <option value="daaqad">Pack (6 pcs)</option>
                                        <option value="custom">Individual Pieces</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        required
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                                <span>Total pieces added to stock:</span>
                                <strong className="text-base text-primary font-bold">
                                    +{calculateAddedPieces()} Pieces
                                </strong>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !selectedProduct}
                                className="w-full py-3 px-4 bg-primary text-white font-medium rounded-xl text-sm hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Inventory"}
                            </button>
                        </form>
                    )}
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-xs space-y-4">
                    <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm">
                        <Info className="w-4 h-4 text-primary" /> Units & Conversion Guide
                    </div>

                    <p className="text-slate-500 dark:text-slate-400">
                        Kafaya Boutique POS automatically converts supplier units into individual pieces for accurate retail POS checkout.
                    </p>

                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between">
                            <span className="text-slate-500">1 Dozen</span>
                            <strong className="text-slate-800 dark:text-slate-200">12 Pieces</strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">1 Pack</span>
                            <strong className="text-slate-800 dark:text-slate-200">6 Pieces</strong>
                        </div>
                    </div>

                    {currentItem && (
                        <div className="mt-4 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                                Selected Product
                            </div>
                            <div className="font-bold text-slate-800 dark:text-white mt-0.5">
                                {currentItem.name}
                            </div>
                            <div className="text-primary font-bold mt-1">
                                Current: {currentItem.stock_quantity} pcs
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}