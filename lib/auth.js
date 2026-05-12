import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'change-me-in-production-please-min-32-chars'
);

const COOKIE_NAME = 'cozumkantin_session';

export async function createSession(payload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET);

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
}

export async function getSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch {
    return null;
  }
}

export function clearSession() {
  cookies().delete(COOKIE_NAME);
}

export async function requireOwner() {
  const session = await getSession();
  if (!session || session.role !== 'owner') {
    return null;
  }
  return session;
}

export async function requireCustomer() {
  const session = await getSession();
  if (!session || session.role !== 'customer') {
    return null;
  }
  return session;
}

export async function requireAnyUser() {
  const session = await getSession();
  return session;
}
