"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function BrandThemeProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = createClient();

    useEffect(() => {
        async function loadBrandSettings() {
            try {
                const { data } = await supabase
                    .from("store_settings")
                    .select("primary_color")
                    .eq("id", 1)
                    .single();

                if (data?.primary_color) {
                    // In Tailwind v4, updating --primary directly updates all bg-primary & text-primary elements
                    document.documentElement.style.setProperty("--primary", data.primary_color);
                    document.documentElement.style.setProperty("--sidebar-primary", data.primary_color);
                    document.documentElement.style.setProperty("--ring", data.primary_color);
                }
            } catch (err) {
                console.error("Error loading brand color:", err);
            }
        }

        loadBrandSettings();
    }, [supabase]);

    return <>{children}</>;
}