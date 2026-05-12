import { NextResponse } from 'next/server';
import {
  getTransactions,
  setTransactions,
  getProducts,
  setProducts,
  getCustomers,
} from '@/lib/kv';
import { requireOwner } from '@/lib/auth';

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export async function GET() {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const txns = await getTransactions();
  return NextResponse.json({ txns });
}

export async function POST(request) {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const body = await request.json();
  const { customerId, items } = body; // items: [{productId, qty, note}]

  if (!customerId || !items || !items.length) {
    return NextResponse.json({ error: 'Müşteri ve ürün gerekli' }, { status: 400 });
  }

  const [customers, products, txns] = await Promise.all([
    getCustomers(),
    getProducts(),
    getTransactions(),
  ]);

  const customer = customers.find((c) => c.id === customerId);
  if (!customer) return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 404 });

  // Validate stock & build line items
  const lineItems = [];
  let total = 0;
  for (const it of items) {
    const p = products.find((x) => x.id === it.productId);
    if (!p) return NextResponse.json({ error: `Ürün bulunamadı: ${it.productId}` }, { status: 400 });
    if (p.stock !== null && p.stock < it.qty) {
      return NextResponse.json({ error: `${p.name} stoğu yetersiz` }, { status: 400 });
    }
    const subtotal = p.price * it.qty;
    total += subtotal;
    lineItems.push({
      productId: p.id,
      productName: p.name,
      unitPrice: p.price,
      qty: it.qty,
      subtotal,
      note: it.note || '',
    });
  }

  const txn = {
    id: uid(),
    customerId,
    items: lineItems,
    total,
    date: new Date().toISOString(),
  };

  // Decrement stock
  const nextProducts = products.map((p) => {
    const it = items.find((x) => x.productId === p.id);
    if (it && p.stock !== null) {
      return { ...p, stock: Math.max(0, p.stock - it.qty) };
    }
    return p;
  });

  await Promise.all([setTransactions([txn, ...txns]), setProducts(nextProducts)]);
  return NextResponse.json({ txn });
}

export async function DELETE(request) {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 });
  const txns = await getTransactions();
  await setTransactions(txns.filter((t) => t.id !== id));
  return NextResponse.json({ ok: true });
}
