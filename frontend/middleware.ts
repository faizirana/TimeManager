/**
 * Middleware - DISABLED for Bearer Token Authentication
 *
 * This middleware has been disabled because access tokens are now stored in memory (React state)
 * and are not accessible to server-side code. Route protection is now handled client-side
 * using the useProtectedRoute hook.
 *
 * Why disabled:
 * - Access tokens stored in memory cannot be read by Edge Runtime middleware
 * - sessionStorage backup is also client-side only
 * - Only refresh tokens remain in httpOnly cookies (not suitable for route protection)
 *
 * Security:
 * - Client-side protection via useProtectedRoute hook
 * - Backend API endpoints still verify Bearer tokens (primary security layer)
 * - XSS protection via CSP headers and in-memory storage
 *
 * To re-enable server-side middleware, you would need to:
 * 1. Switch back to storing access tokens in httpOnly cookies
 * 2. Update AuthContext to read from cookies
 * 3. Uncomment the code below
 */

import { NextResponse } from "next/server";
// import { NextRequest } from "next/server";
// import { verifyToken } from "@/lib/services/auth/jwt";

// export async function middleware(req: NextRequest) {
//   const token = req.cookies.get("accessToken")?.value;
//
//   if (!token) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }
//
//   // Verify token signature and expiration with jose (Edge Runtime compatible)
//   const payload = await verifyToken(token);
//
//   if (!payload) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }
//
//   return NextResponse.next();
// }

/**
 * Middleware is now a pass-through - all routes are accessible
 * Protection is enforced by:
 * 1. Client-side: useProtectedRoute hook redirects to /login
 * 2. Server-side: Backend API verifies Bearer tokens
 */
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/admin/:path*", "/teams", "/teams/:path*"],
};
