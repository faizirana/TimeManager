import { NextResponse, NextRequest } from "next/server";
import { verifyToken } from "@/lib/services/auth/jwt";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Verify token signature and expiration with jose (Edge Runtime compatible)
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/admin/:path*", "/teams", "/teams/:path*"], // Protect this routes
};
