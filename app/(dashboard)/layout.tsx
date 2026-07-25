"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import InactivityTimeout from "@/components/InactivityTimeout";
import { createClient } from "@/lib/supabase/client";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userRole, setUserRole] = useState<string>("staff");
    const [userName, setUserName] = useState<string>("User");

    useEffect(() => {
        const supabase = createClient();

        async function getUserProfile() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("full_name, role")
                    .eq("id", user.id)
                    .single();

                if (profile) {
                    setUserRole(profile.role || "staff");
                    setUserName(profile.full_name || user.email || "Staff Member");
                }
            }
        }

        getUserProfile();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
            {/* Dynamic 15-Second Inactivity Listener */}
            <InactivityTimeout />

            {/* Sidebar Navigation */}
            <Sidebar
                userRole={userRole}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <Header
                    onOpenSidebar={() => setSidebarOpen(true)}
                    userName={userName}
                />
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}