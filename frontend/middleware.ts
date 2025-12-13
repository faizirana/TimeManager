import { NextResponse, NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    if (!token || !verifyToken(token)) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
}
export const config = {
    matcher: ["/dashboard/:path*", "/admin/:path*"], // Protect this routes
};
