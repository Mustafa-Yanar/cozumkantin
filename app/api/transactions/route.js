import { NextResponse } from 'next/server';
import { getTransactions, setTransactions, getProducts, getCustomers, getPayments } from '@/lib/kv';
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
  const { customerId, items } = body;

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

  const lineItems = [];
  let total = 0;
  for (const it of items) {
    const p = products.find((x) => x.id === it.productId);
    if (!p) return NextResponse.json({ error: `Ürün bulunamadı: ${it.productId}` }, { status: 400 });
    const subtotal = p.price * it.qty;
    total += subtotal;
    lineItems.push({ productId: p.id, productName: p.name, unitPrice: p.price, qty: it.qty, subtotal, note: it.note || '' });
  }

  const txn = { id: uid(), customerId, items: lineItems, total, date: new Date().toISOString() };
  await setTransactions([txn, ...txns]);
  return NextResponse.json({ txn });
}

// PATCH: update qty of a single item in a transaction
export async function PATCH(request) {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const body = await request.json();
  const { id, itemIndex, newQty } = body;
  if (!id || itemIndex === undefined || !newQty || newQty < 1) {
    return NextResponse.json({ error: 'Geçersiz parametre' }, { status: 400 });
  }

  const [txns, payments] = await Promise.all([getTransactions(), getPayments()]);
  const txn = txns.find(t => t.id === id);
  if (!txn) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });

  const item = txn.items[itemIndex];
  if (!item) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });

  const newItems = txn.items.map((it, i) => i === itemIndex
    ? { ...it, qty: newQty, subtotal: it.unitPrice * newQty }
    : it
  );
  const newTxnTotal = newItems.reduce((s, i) => s + i.subtotal, 0);
  const otherTxnsTotal = txns.filter(t => t.id !== id && t.customerId === txn.customerId).reduce((s, t) => s + t.total, 0);
  const totalPaid = payments.filter(p => p.customerId === txn.customerId).reduce((s, p) => s + p.amount, 0);
  if (otherTxnsTotal + newTxnTotal < totalPaid) {
    return NextResponse.json({ error: 'Bu değişiklik bakiyeyi eksiye düşürür' }, { status: 400 });
  }

  const updatedTxn = { ...txn, items: newItems, total: newTxnTotal };
  await setTransactions(txns.map(t => t.id === id ? updatedTxn : t));
  return NextResponse.json({ txn: updatedTxn });
}

export async function DELETE(request) {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const itemIndex = searchParams.get('itemIndex');
  if (!id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 });

  const [txns, payments] = await Promise.all([getTransactions(), getPayments()]);
  const txn = txns.find((t) => t.id === id);
  if (!txn) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });

  const customerId = txn.customerId;
  const totalPaid = payments.filter((p) => p.customerId === customerId).reduce((s, p) => s + p.amount, 0);

  if (itemIndex !== null) {
    const idx = parseInt(itemIndex);
    const removedAmount = txn.items[idx]?.subtotal ?? 0;
    const newItems = txn.items.filter((_, i) => i !== idx);
    const newTxnTotal = newItems.reduce((s, i) => s + i.subtotal, 0);
    const otherTxnsTotal = txns.filter((t) => t.id !== id).filter((t) => t.customerId === customerId).reduce((s, t) => s + t.total, 0);
    const newTotalDebt = otherTxnsTotal + newTxnTotal;
    if (newTotalDebt < totalPaid) {
      return NextResponse.json({ error: 'Bu ürün silinirse bakiye eksiye düşer' }, { status: 400 });
    }
    if (newItems.length === 0) {
      await setTransactions(txns.filter((t) => t.id !== id));
    } else {
      const updatedTxn = { ...txn, items: newItems, total: newTxnTotal };
      await setTransactions(txns.map((t) => (t.id === id ? updatedTxn : t)));
    }
  } else {
    const newTotalDebt = txns.filter((t) => t.id !== id && t.customerId === customerId).reduce((s, t) => s + t.total, 0);
    if (newTotalDebt < totalPaid) {
      return NextResponse.json({ error: 'Bu alışveriş silinirse bakiye eksiye düşer' }, { status: 400 });
    }
    await setTransactions(txns.filter((t) => t.id !== id));
  }

  return NextResponse.json({ ok: true });
}
