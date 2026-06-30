import { NextResponse, NextRequest } from "next/server";

const publicRoutes = ["/login", "/register", "/forgot-password"];
const adminRoutes = ["/admin"];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("auth_token")?.value;
    const userDataCookie = request.cookies.get("user_data")?.value;
    const user = userDataCookie ? JSON.parse(userDataCookie) : null;

    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    if (!token && !isPublicRoute) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
    if (token && user) {
        if (isAdminRoute && user.role !== "admin") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    if (token && isPublicRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/register",
        "/dashboard/:path*",
        "/login",
        "/forgot-password",
        "/admin/:path*",
    ],
};
