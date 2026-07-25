import React from "react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden">
            {/* Visual background accents */}
            <div className="absolute top-0 -left-12 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 -right-12 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md relative z-10">{children}</div>
        </div>
    );
}