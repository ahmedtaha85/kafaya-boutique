"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function InactivityTimeout() {
    const router = useRouter();
    const supabase = createClient();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 15 seconds limit
    const INACTIVITY_LIMIT_MS = 15000;

    const handleSignOut = useCallback(async () => {
        try {
            await supabase.auth.signOut();
            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error("Error signing out:", error);
        }
    }, [supabase, router]);

    const resetTimeout = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(handleSignOut, INACTIVITY_LIMIT_MS);
    }, [handleSignOut]);

    useEffect(() => {
        // Start initial timer
        resetTimeout();

        const events = [
            "mousedown",
            "mousemove",
            "keydown",
            "scroll",
            "touchstart",
            "click",
        ];

        const handleUserActivity = () => {
            resetTimeout();
        };

        // Attach event listeners
        events.forEach((event) => {
            window.addEventListener(event, handleUserActivity);
        });

        // Clean up
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            events.forEach((event) => {
                window.removeEventListener(event, handleUserActivity);
            });
        };
    }, [resetTimeout]);

    return null;
}