import { NextResponse } from 'next/server';
import { getPayments, setPayments, getCustomers } from '@/lib/kv';
import { requireOwner } from '@/lib/auth';

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export async function GET() {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const payments = await getPayments();
  return NextResponse.json({ payments });
}

export async function POST(request) {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const body = await request.json();
  const { customerId, amount } = body;

  if (!customerId || !amount || amount <= 0) {
    return NextResponse.json({ error: 'Geçerli müşteri ve tutar gerekli' }, { status: 400 });
  }

  const [customers, payments] = await Promise.all([getCustomers(), getPayments()]);
  const customer = customers.find((c) => c.id === customerId);
  if (!customer) return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 404 });

  const pay = {
    id: uid(),
    customerId,
    amount: parseFloat(amount),
    date: new Date().toISOString(),
  };
  await setPayments([pay, ...payments]);
  return NextResponse.json({ payment: pay });
}

export async function DELETE(request) {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 });
  const payments = await getPayments();
  await setPayments(payments.filter((p) => p.id !== id));
  return NextResponse.json({ ok: true });
}
