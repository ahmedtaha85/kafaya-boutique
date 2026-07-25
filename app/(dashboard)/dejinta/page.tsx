"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Palette, CheckCircle2, Loader2, Save } from "lucide-react";

export default function SettingsPage() {
    const [primaryColor, setPrimaryColor] = useState("#510C21");
    const [secondaryColor, setSecondaryColor] = useState("#98702B");
    const [accentColor, setAccentColor] = useState("#1A1A1A");
    const [bgColor, setBgColor] = useState("#FAFAFA");
    const [logoUrl, setLogoUrl] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        async function loadSettings() {
            try {
                const { data } = await supabase
                    .from("store_settings")
                    .select("*")
                    .eq("id", 1)
                    .single();

                if (data) {
                    if (data.primary_color) setPrimaryColor(data.primary_color);
                    if (data.secondary_color) setSecondaryColor(data.secondary_color);
                    if (data.accent_color) setAccentColor(data.accent_color);
                    if (data.bg_color) setBgColor(data.bg_color);
                    if (data.logo_url) setLogoUrl(data.logo_url);
                }
            } catch (err) {
                console.error("Error loading settings:", err);
            } finally {
                setLoading(false);
            }
        }

        loadSettings();
    }, [supabase]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);

        try {
            const { error } = await supabase.from("store_settings").upsert({
                id: 1,
                logo_url: logoUrl,
                primary_color: primaryColor,
                secondary_color: secondaryColor,
                accent_color: accentColor,
                bg_color: bgColor,
                updated_at: new Date().toISOString(),
            });

            if (error) throw error;

            // Apply Live Theme Update directly to Root Element
            document.documentElement.style.setProperty("--primary-color", primaryColor);

            setSuccess(true);
        } catch (err: any) {
            alert(err.message || "Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Brand & System Settings
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Customize colors, branding, and identity for Kafaya Boutique.
                </p>
            </div>

            {success && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Store settings saved and live dynamic colors updated!
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
                {/* Colors Palette Section */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm pb-2 border-b border-slate-100 dark:border-slate-800">
                        <Palette className="w-4 h-4 text-primary" /> Brand Palette Colors
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Primary Color (Main Buttons & Highlights)
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                                />
                                <input
                                    type="text"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Secondary Color
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={secondaryColor}
                                    onChange={(e) => setSecondaryColor(e.target.value)}
                                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                                />
                                <input
                                    type="text"
                                    value={secondaryColor}
                                    onChange={(e) => setSecondaryColor(e.target.value)}
                                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-xs hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                    {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <Save className="w-4 h-4" /> Save Brand Settings
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}