"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const supabase = createClient();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            setSuccess(true);
        } catch (err: any) {
            setErrorMsg(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl max-w-md w-full">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Reset Password
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {success ? (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-center space-y-3">
                        <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600" />
                        <p className="text-sm font-medium">
                            Password reset link has been sent to your email. Please check your inbox.
                        </p>
                        <Link
                            href="/login"
                            className="inline-block text-xs font-bold text-emerald-800 underline mt-2"
                        >
                            Back to Sign In
                        </Link>
                    </div>
                ) : (
                    <>
                        {errorMsg && (
                            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-3 rounded-lg mb-4">
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleReset} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    E-mail Address
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

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 bg-primary text-white font-medium rounded-xl text-sm hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
                            </button>
                        </form>
                    </>
                )}

                <div className="mt-6 text-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}