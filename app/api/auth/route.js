import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getOwnerHash, setOwnerHash, getCustomers } from '@/lib/kv';
import { createSession, clearSession, getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  const ownerHash = await getOwnerHash();
  return NextResponse.json({
    session,
    ownerExists: !!ownerHash,
  });
}

export async function POST(request) {
  const body = await request.json();
  const { action } = body;

  if (action === 'owner-setup') {
    const existing = await getOwnerHash();
    if (existing) {
      return NextResponse.json({ error: 'Şifre zaten kurulu' }, { status: 400 });
    }
    if (!body.password || body.password.length < 4) {
      return NextResponse.json({ error: 'Şifre en az 4 karakter olmalı' }, { status: 400 });
    }
    const hash = await bcrypt.hash(body.password, 10);
    await setOwnerHash(hash);
    await createSession({ role: 'owner' });
    return NextResponse.json({ ok: true });
  }

  if (action === 'owner-login') {
    const hash = await getOwnerHash();
    if (!hash) {
      return NextResponse.json({ error: 'Önce kurulum yapın' }, { status: 400 });
    }
    const ok = await bcrypt.compare(body.password || '', hash);
    if (!ok) {
      return NextResponse.json({ error: 'Şifre hatalı' }, { status: 401 });
    }
    await createSession({ role: 'owner' });
    return NextResponse.json({ ok: true });
  }

  if (action === 'customer-login') {
    const customers = await getCustomers();
    const c = customers.find(
      (c) =>
        c.username.toLowerCase() === (body.username || '').toLowerCase() &&
        c.password === body.password
    );
    if (!c) {
      return NextResponse.json(
        { error: 'Kullanıcı adı veya şifre hatalı' },
        { status: 401 }
      );
    }
    await createSession({ role: 'customer', customerId: c.id, name: c.name, username: c.username });
    return NextResponse.json({ ok: true, customer: { id: c.id, name: c.name, username: c.username } });
  }

  if (action === 'logout') {
    clearSession();
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Bilinmeyen işlem' }, { status: 400 });
}
