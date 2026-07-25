"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
    Plus,
    Search,
    Package,
    Edit2,
    Trash2,
    Loader2,
    Image as ImageIcon,
} from "lucide-react";

type Product = {
    id: string;
    name: string;
    category: string;
    price: number;
    stock_quantity: number;
    image_url?: string;
};

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        async function fetchProducts() {
            try {
                const { data, error } = await supabase
                    .from("products")
                    .select("*")
                    .order("name", { ascending: true });

                if (error) throw error;
                setProducts(data || []);
            } catch (err) {
                console.error("Error fetching products:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, [supabase]);

    const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

    const filteredProducts = products.filter((product) => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
            selectedCategory === "All" || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const { error } = await supabase.from("products").delete().eq("id", id);
            if (error) throw error;
            setProducts((prev) => prev.filter((p) => p.id !== id));
        } catch (err: any) {
            alert(err.message || "Failed to delete product.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Product Management
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Manage inventory items, pricing, categories, and image assets.
                    </p>
                </div>

                <Link
                    href="/alaabta/new"
                    className="px-4 py-2.5 bg-primary text-white font-semibold rounded-xl text-xs hover:opacity-90 transition flex items-center justify-center gap-2 shadow-md shadow-primary/20 shrink-0"
                >
                    <Plus className="w-4 h-4" /> Add New Product
                </Link>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search products by name or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                    />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition ${selectedCategory === cat
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Display Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-16 space-y-2">
                        <Package className="w-12 h-12 text-slate-300 mx-auto stroke-1" />
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                            No products found
                        </h3>
                        <p className="text-xs text-slate-400">
                            Try adjusting your search query or add a new product.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-4">Item</th>
                                    <th className="py-3.5 px-4">Category</th>
                                    <th className="py-3.5 px-4">Price</th>
                                    <th className="py-3.5 px-4">Stock</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredProducts.map((prod) => (
                                    <tr
                                        key={prod.id}
                                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition"
                                    >
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                                                    {prod.image_url ? (
                                                        <img
                                                            src={prod.image_url}
                                                            alt={prod.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <ImageIcon className="w-4 h-4 text-slate-400" />
                                                    )}
                                                </div>
                                                <span className="font-bold text-slate-900 dark:text-white text-xs">
                                                    {prod.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                                            {prod.category}
                                        </td>
                                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                                            ${Number(prod.price).toFixed(2)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${prod.stock_quantity <= 5
                                                        ? "bg-rose-50 text-rose-600 border border-rose-200"
                                                        : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                                    }`}
                                            >
                                                {prod.stock_quantity} Pcs
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/alaabta/${prod.id}`}
                                                    className="p-1.5 text-slate-600 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(prod.id)}
                                                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}