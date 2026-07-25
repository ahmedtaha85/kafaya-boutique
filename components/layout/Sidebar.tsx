"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    ArrowDownToLine,
    Calculator,
    Receipt,
    BarChart3,
    Settings,
    Sparkles,
    User,
    X,
    FileSpreadsheet, // Calaamadda Reports-ka
    MessageSquare,   // Calaamadda Chat-ka
} from "lucide-react";

interface SidebarProps {
    userRole?: string;
    isOpen?: boolean;
    onClose?: () => void;
}

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "POS / Checkout", href: "/iibi", icon: ShoppingCart },
    { name: "Products", href: "/alaabta", icon: Package },
    { name: "Stock Entry", href: "/soogasho", icon: ArrowDownToLine },
    { name: "Accounting", href: "/xisaabiye", icon: Calculator },
    { name: "Expenses", href: "/kharashaadka", icon: Receipt },
    { name: "Reports & Export", href: "/reports", icon: FileSpreadsheet }, // Qeybta Cusub ee Excel/PDF
    { name: "Store Chat", href: "/chat", icon: MessageSquare },             // Qeybta Cusub ee Realtime Chat
    { name: "Analytics", href: "/ganacsi", icon: BarChart3 },
    { name: "Settings", href: "/dejinta", icon: Settings },
];

export default function Sidebar({
    userRole = "Admin",
    isOpen = true,
    onClose,
}: SidebarProps) {
    const pathname = usePathname();
    const [imageError, setImageError] = useState(false);

    return (
        <>
            {/* Mobile Backdrop Overlay */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                />
            )}

            <aside
                className={`fixed lg:static top-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen shrink-0 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}
            >
                {/* 1. LOGO SECTION */}
                <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-start relative min-h-[80px]">
                    {!imageError ? (
                        <img
                            src="/official.png"
                            alt="Kafaya Boutique Logo"
                            className="w-[350px] h-auto object-contain object-left"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div
                            style={{ backgroundColor: "var(--primary, #510C21)" }}
                            className="w-12 h-12 rounded-xl text-white flex items-center justify-center shadow-sm"
                        >
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                    )}

                    {/* Mobile Close Button */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="lg:hidden absolute top-4 right-4 p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* 2. FULL NAVIGATION MENU */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={onClose}
                                style={
                                    isActive
                                        ? {
                                            backgroundColor: "var(--primary, #510C21)",
                                            color: "#ffffff",
                                        }
                                        : {}
                                }
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${isActive
                                        ? "shadow-md shadow-primary/20"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                    }`}
                            >
                                <Icon
                                    className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400"
                                        }`}
                                />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* 3. USER FOOTER */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200">
                                <User className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                                    Kafaya Staff
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium capitalize">
                                    {userRole}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}