import { NextResponse } from 'next/server';
import {
  getCustomers,
  setCustomers,
  getTransactions,
  setTransactions,
  getPayments,
  setPayments,
} from '@/lib/kv';
import { requireOwner } from '@/lib/auth';

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export async function GET() {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const customers = await getCustomers();
  return NextResponse.json({ customers });
}

export async function POST(request) {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const body = await request.json();
  const customers = await getCustomers();
  if (!body.name || !body.username || !body.password) {
    return NextResponse.json({ error: 'Tüm alanlar zorunlu' }, { status: 400 });
  }
  if (customers.find((c) => c.username.toLowerCase() === body.username.toLowerCase())) {
    return NextResponse.json({ error: 'Bu kullanıcı adı zaten kullanılıyor' }, { status: 400 });
  }
  const c = {
    id: uid(),
    name: body.name,
    username: body.username,
    password: body.password,
    createdAt: new Date().toISOString(),
  };
  await setCustomers([...customers, c]);
  return NextResponse.json({ customer: c });
}

export async function PUT(request) {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const body = await request.json();
  const customers = await getCustomers();
  const idx = customers.findIndex((c) => c.id === body.id);
  if (idx < 0) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });
  if (
    body.username &&
    customers.find(
      (c) => c.id !== body.id && c.username.toLowerCase() === body.username.toLowerCase()
    )
  ) {
    return NextResponse.json({ error: 'Bu kullanıcı adı zaten kullanılıyor' }, { status: 400 });
  }
  const next = [...customers];
  next[idx] = {
    ...next[idx],
    name: body.name ?? next[idx].name,
    username: body.username ?? next[idx].username,
    password: body.password ?? next[idx].password,
  };
  await setCustomers(next);
  return NextResponse.json({ customer: next[idx] });
}

export async function DELETE(request) {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 });

  const [customers, txns, payments] = await Promise.all([
    getCustomers(),
    getTransactions(),
    getPayments(),
  ]);
  await Promise.all([
    setCustomers(customers.filter((c) => c.id !== id)),
    setTransactions(txns.filter((t) => t.customerId !== id)),
    setPayments(payments.filter((p) => p.customerId !== id)),
  ]);
  return NextResponse.json({ ok: true });
}
