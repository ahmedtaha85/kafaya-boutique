"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Lock, Mail, Phone, Sparkles, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        try {
            if (authMethod === "email") {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signInWithOtp({
                    phone: phone.startsWith("+") ? phone : `+252${phone}`,
                });
                if (error) throw error;
                alert("OTP verification code has been sent to your phone.");
            }

            router.push("/");
            router.refresh();
        } catch (err: any) {
            setErrorMsg(err.message || "Invalid login credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl max-w-md w-full mx-auto">
            <div className="text-center mb-8 flex flex-col items-center justify-center">
                {!imageError ? (
                    <img
                        src="/logo.png"
                        alt="Kafaya Boutique Logo"
                        className="w-[300px] h-auto object-contain mb-3"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
                        <Sparkles className="w-6 h-6" />
                    </div>
                )}

                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Kafaya Boutique
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Store & POS Management System
                </p>
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6">
                <button
                    type="button"
                    onClick={() => setAuthMethod("email")}
                    className={`flex-1 text-xs font-medium py-2 rounded-lg transition-all ${authMethod === "email"
                            ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                >
                    E-mail
                </button>
                <button
                    type="button"
                    onClick={() => setAuthMethod("phone")}
                    className={`flex-1 text-xs font-medium py-2 rounded-lg transition-all ${authMethod === "phone"
                            ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                >
                    Phone (OTP)
                </button>
            </div>

            {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-3 rounded-lg mb-4">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
                {authMethod === "email" ? (
                    <>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                E-mail
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    autoComplete="off"
                                    placeholder="admin@kafaya.so"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                                    Password
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-primary hover:underline font-medium"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Phone Number
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                                type="tel"
                                required
                                autoComplete="off"
                                placeholder="61XXXXXXX"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                            />
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 bg-primary text-white font-medium rounded-xl text-sm hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : authMethod === "email" ? (
                        "Sign In"
                    ) : (
                        "Send OTP Code"
                    )}
                </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500">
                Don't have an account yet?{" "}
                <Link href="/register" className="text-primary font-bold hover:underline">
                    Create Account
                </Link>
            </div>
        </div>
    );
}