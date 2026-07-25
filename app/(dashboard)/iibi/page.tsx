"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Search,
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    CheckCircle,
    CreditCard,
    DollarSign,
    Smartphone,
    Loader2,
    Package,
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

type CartItem = {
    product: Product;
    quantity: number;
};

export default function POSTerminalPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "evc" | "card">("evc");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        async function loadProducts() {
            try {
                const { data, error } = await supabase
                    .from("products")
                    .select("*")
                    .gt("stock_quantity", 0)
                    .order("name", { ascending: true });

                if (error) throw error;
                setProducts(data || []);
            } catch (err) {
                console.error("Error loading POS products:", err);
            } finally {
                setLoading(false);
            }
        }

        loadProducts();
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

    const addToCart = (product: Product) => {
        setCart((prevCart) => {
            const existing = prevCart.find((item) => item.product.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock_quantity) return prevCart;
                return prevCart.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevCart, { product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart((prevCart) =>
            prevCart
                .map((item) => {
                    if (item.product.id === productId) {
                        const newQty = item.quantity + delta;
                        if (newQty > item.product.stock_quantity) return item;
                        return newQty > 0 ? { ...item, quantity: newQty } : null;
                    }
                    return item;
                })
                .filter(Boolean) as CartItem[]
        );
    };

    const removeFromCart = (productId: string) => {
        setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
    };

    const totalAmount = cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setSubmitting(true);
        setSuccessMsg(null);

        try {
            const { data: sale, error: saleError } = await supabase
                .from("sales")
                .insert([
                    {
                        total_amount: totalAmount,
                        payment_method: paymentMethod,
                        created_at: new Date().toISOString(),
                    },
                ])
                .select()
                .single();

            if (saleError) throw saleError;

            for (const item of cart) {
                await supabase.from("sale_items").insert([
                    {
                        sale_id: sale.id,
                        product_id: item.product.id,
                        quantity: item.quantity,
                        unit_price: item.product.price,
                    },
                ]);

                await supabase
                    .from("products")
                    .update({
                        stock_quantity: item.product.stock_quantity - item.quantity,
                    })
                    .eq("id", item.product.id);
            }

            setCart([]);
            setSuccessMsg(`Sale Completed! Total: $${totalAmount.toFixed(2)}`);

            const { data: refreshed } = await supabase
                .from("products")
                .select("*")
                .gt("stock_quantity", 0)
                .order("name", { ascending: true });
            if (refreshed) setProducts(refreshed);
        } catch (err: any) {
            alert(err.message || "Failed to complete transaction.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
            {/* Products Column */}
            <div className="lg:col-span-2 flex flex-col space-y-4 h-full overflow-hidden">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Point of Sale (POS)
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Select products and process retail checkout orders instantly.
                    </p>
                </div>

                {/* Filter controls */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by product name or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition ${selectedCategory === cat
                                        ? "bg-primary text-white"
                                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* MODERN COMPACT POS GRID (Fixes elongated cards) */}
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 pr-1 content-start">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 cursor-pointer hover:border-primary hover:shadow-md transition flex flex-col justify-between group h-[190px]"
                            >
                                {/* Thumbnail Container */}
                                <div className="w-full h-24 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative border border-slate-100 dark:border-slate-700/50 flex items-center justify-center">
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                        />
                                    ) : (
                                        <ImageIcon className="w-6 h-6 text-slate-300" />
                                    )}
                                    <span className="absolute top-1.5 right-1.5 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                                        {product.stock_quantity} left
                                    </span>
                                </div>

                                {/* Details */}
                                <div className="mt-2">
                                    <div className="font-bold text-slate-900 dark:text-white text-xs truncate group-hover:text-primary transition">
                                        {product.name}
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-xs font-black text-slate-900 dark:text-white">
                                            ${Number(product.price).toFixed(2)}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                                            {product.category}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cart & Checkout Panel */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm h-full">
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
                            <ShoppingCart className="w-5 h-5 text-primary" /> Current Order
                        </div>
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-slate-600 dark:text-slate-400 font-semibold">
                            {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
                        </span>
                    </div>

                    {successMsg && (
                        <div className="my-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 shrink-0" /> {successMsg}
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto py-3 space-y-3">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-6">
                                <Package className="w-12 h-12 mb-2 stroke-1" />
                                <p className="text-xs">Cart is empty. Tap any product to add to order.</p>
                            </div>
                        ) : (
                            cart.map(({ product, quantity }) => (
                                <div
                                    key={product.id}
                                    className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
                                >
                                    <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                                            {product.image_url ? (
                                                <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                                                {product.name}
                                            </div>
                                            <div className="text-[11px] text-slate-500">
                                                ${Number(product.price).toFixed(2)} × {quantity}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                                            <button
                                                onClick={() => updateQuantity(product.id, -1)}
                                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition rounded-l-lg"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="px-2 text-xs font-bold">{quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(product.id, 1)}
                                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition rounded-r-lg"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(product.id)}
                                            className="text-rose-500 hover:text-rose-700 p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Total & Checkout */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Payment Method
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("evc")}
                                className={`py-2 px-2 text-xs font-medium rounded-xl border flex flex-col items-center gap-1 transition ${paymentMethod === "evc"
                                        ? "border-primary bg-primary/10 text-primary font-bold"
                                        : "border-slate-200 dark:border-slate-800 text-slate-600"
                                    }`}
                            >
                                <Smartphone className="w-4 h-4" /> EVC / Mobile
                            </button>

                            <button
                                type="button"
                                onClick={() => setPaymentMethod("cash")}
                                className={`py-2 px-2 text-xs font-medium rounded-xl border flex flex-col items-center gap-1 transition ${paymentMethod === "cash"
                                        ? "border-primary bg-primary/10 text-primary font-bold"
                                        : "border-slate-200 dark:border-slate-800 text-slate-600"
                                    }`}
                            >
                                <DollarSign className="w-4 h-4" /> Cash
                            </button>

                            <button
                                type="button"
                                onClick={() => setPaymentMethod("card")}
                                className={`py-2 px-2 text-xs font-medium rounded-xl border flex flex-col items-center gap-1 transition ${paymentMethod === "card"
                                        ? "border-primary bg-primary/10 text-primary font-bold"
                                        : "border-slate-200 dark:border-slate-800 text-slate-600"
                                    }`}
                            >
                                <CreditCard className="w-4 h-4" /> Card
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-lg font-bold text-slate-900 dark:text-white pt-2">
                        <span>Total:</span>
                        <span className="text-2xl text-primary font-black">
                            ${totalAmount.toFixed(2)}
                        </span>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || submitting}
                        className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-xs hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {submitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            `Complete Checkout ($${totalAmount.toFixed(2)})`
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}