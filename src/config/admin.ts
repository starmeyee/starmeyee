import { Role } from "@/types";

/**
 * Roles that are permitted to access the admin dashboard.
 */
export const ELEVATED_ROLES: Role[] = ["owner", "admin", "editor"];

/**
 * Email allowlist for admin access.
 *
 * Configure in production via NEXT_PUBLIC_ADMIN_EMAILS (comma-separated), e.g.:
 *   NEXT_PUBLIC_ADMIN_EMAILS="you@example.com,partner@example.com"
 *
 * The defaults below are the accounts referenced by the project's setup
 * scripts so the existing owner is never locked out. Any email listed here is
 * automatically granted the "owner" role on login.
 */
const DEFAULT_ADMIN_EMAILS = ["admin@starmeyee.com", "admin@starmeyee.in"];

export const ADMIN_EMAILS: string[] = (
  process.env.NEXT_PUBLIC_ADMIN_EMAILS
    ? process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(",")
    : DEFAULT_ADMIN_EMAILS
)
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export function hasAdminAccess(
  email: string | null | undefined,
  role: Role | string | null | undefined
): boolean {
  if (isAdminEmail(email)) return true;
  return !!role && ELEVATED_ROLES.includes(role as Role);
}
