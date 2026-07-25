import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    // 1. Initialize Supabase Client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // 2. Auth Check - Refresh session & Fetch user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Ogolaow dhammaan bogagga la xiriira Auth-ka (Login, Register, Signup, Reset Password)
    const isAuthPage =
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/signup") ||
        pathname.startsWith("/forgot-password");

    // A. HADDII UUSAN LOGIN SANEAN (UNAUTHENTICATED):
    // Haddii uu isku dayo inuu galo bogagga dukaanka iyadoo uusan joogin bog Auth ah -> U leexi /login
    if (!user && !isAuthPage) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // B. HADDII UU HOREY U LOGIN-SAN YAHAY (AUTHENTICATED):
    // Haddii uu joogo bog Auth ah (sida /login ama /register) -> U leexi Dashboard-ka (/)
    if (user && isAuthPage) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}