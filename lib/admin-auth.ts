import crypto from 'node:crypto';

/** True when the request carries the admin password the admin panel sends. */
export function isAdmin(request: Request): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  const given = request.headers.get('x-admin-password');
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
