"use client";

import { Menu, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type HeaderProps = {
    onOpenSidebar: () => void;
    userName?: string;
};

export default function Header({ onOpenSidebar, userName = "User" }: HeaderProps) {
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    return (
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
                <button
                    onClick={onOpenSidebar}
                    className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <span className="text-xs font-semibold text-slate-400">
                    Store Dashboard
                </span>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <User className="w-4 h-4 text-primary" />
                    <span>{userName}</span>
                </div>

                <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        </header>
    );
}