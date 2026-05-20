import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { User } from './types';

const COOKIE = 'stuns_session';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}

export async function signToken(user: User) {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    is_admin: user.is_admin,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  return {
    id: Number(payload.id),
    email: String(payload.email),
    name: String(payload.name),
    is_admin: Boolean(payload.is_admin),
  } as User;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
}

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function getTokenFromRequest(request: Request): Promise<string | null> {
  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

export async function getUserFromRequest(request: Request): Promise<User | null> {
  const token = await getTokenFromRequest(request);
  if (!token) return getSessionUser();
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export function isAdminEmail(email: string) {
  const admin = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  return admin && email.toLowerCase() === admin;
}
