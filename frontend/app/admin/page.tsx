/**
 * Automatically redirects any visit to /admin to /admin/dashboard.
 * Uses Next.js server-side redirect for optimal UX.
 * @see https://nextjs.org/docs/app/api-reference/functions/redirect
 * @returns never (never returns a component, always performs an immediate redirect)
 */

import { redirect } from "next/navigation";

export default function AdminRootRedirect() {
  redirect("/admin/dashboard");
}
