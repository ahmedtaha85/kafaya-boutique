"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Lock, Mail, User, Sparkles, Loader2, ShieldCheck, MailCheck } from "lucide-react";

export default function RegisterPage() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"admin" | "staff">("admin");

    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);

    const supabase = createClient();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/login`,
                    data: {
                        full_name: fullName,
                        role: role,
                    },
                },
            });

            if (error) throw error;

            if (data.user) {
                await supabase.from("profiles").upsert({
                    id: data.user.id,
                    full_name: fullName,
                    role: role,
                });

                setIsSubmitted(true);
            }
        } catch (err: any) {
            setErrorMsg(err.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl max-w-md w-full mx-auto">
            <div className="text-center mb-6 flex flex-col items-center justify-center">
                {/* LOGO SECTION */}
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
                    {isSubmitted ? "Verify Your Email" : "Create New Account"}
                </p>
            </div>

            {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-3 rounded-lg mb-4">
                    {errorMsg}
                </div>
            )}

            {!isSubmitted ? (
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                required
                                placeholder="Fardowsa Mohamed"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            E-mail
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                                type="email"
                                required
                                placeholder="admin@kafaya.so"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                                type="password"
                                required
                                minLength={6}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            User Role
                        </label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value as "admin" | "staff")}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                            >
                                <option value="admin">Admin (Manager)</option>
                                <option value="staff">Staff (Employee)</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-3 px-4 bg-primary text-white font-medium rounded-xl text-sm hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign Up"}
                    </button>
                </form>
            ) : (
                <div className="text-center space-y-4 py-4">
                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <MailCheck className="w-8 h-8" />
                    </div>

                    <div className="space-y-1">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">
                            Confirmation Link Sent!
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            We have sent a confirmation email to: <br />
                            <strong className="text-primary">{email}</strong>
                        </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
                        Please check your Inbox or Spam folder and click the link to activate your account.
                    </div>

                    <Link
                        href="/login"
                        className="block w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white font-semibold rounded-xl text-xs transition"
                    >
                        Go to Login Page
                    </Link>
                </div>
            )}

            {!isSubmitted && (
                <div className="mt-6 text-center text-xs text-slate-500">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary font-bold hover:underline">
                        Sign In
                    </Link>
                </div>
            )}
        </div>
    );
}