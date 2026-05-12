import { NextResponse } from 'next/server';
import { getAllData } from '@/lib/kv';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Oturum yok' }, { status: 401 });
  }

  const data = await getAllData();

  if (session.role === 'owner') {
    return NextResponse.json(data);
  }

  if (session.role === 'customer') {
    const cId = session.customerId;
    const customer = data.customers.find((c) => c.id === cId);
    if (!customer) {
      return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 404 });
    }
    return NextResponse.json({
      customer: { id: customer.id, name: customer.name, username: customer.username },
      products: data.products.map((p) => ({ id: p.id, name: p.name, price: p.price })),
      txns: data.txns.filter((t) => t.customerId === cId),
      payments: data.payments.filter((p) => p.customerId === cId),
    });
  }

  return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
}
