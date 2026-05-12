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

// PATCH: update qty of a single item in a transaction
export async function PATCH(request) {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const body = await request.json();
  const { id, itemIndex, newQty } = body;
  if (!id || itemIndex === undefined || !newQty || newQty < 1) {
    return NextResponse.json({ error: 'Geçersiz parametre' }, { status: 400 });
  }

  const [txns, products] = await Promise.all([getTransactions(), getProducts()]);
  const txn = txns.find(t => t.id === id);
  if (!txn) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });

  const item = txn.items[itemIndex];
  if (!item) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });

  const diff = newQty - item.qty; // positive = needs more stock, negative = returns stock
  const product = products.find(p => p.id === item.productId);
  if (product && product.stock !== null && diff > 0 && product.stock < diff) {
    return NextResponse.json({ error: `${product.name} stoğu yetersiz` }, { status: 400 });
  }

  const newItems = txn.items.map((it, i) => i === itemIndex
    ? { ...it, qty: newQty, subtotal: it.unitPrice * newQty }
    : it
  );
  const updatedTxn = { ...txn, items: newItems, total: newItems.reduce((s, i) => s + i.subtotal, 0) };

  const nextProducts = products.map(p =>
    p.id === item.productId && p.stock !== null
      ? { ...p, stock: Math.max(0, p.stock - diff) }
      : p
  );

  await Promise.all([
    setTransactions(txns.map(t => t.id === id ? updatedTxn : t)),
    setProducts(nextProducts),
  ]);

  return NextResponse.json({ txn: updatedTxn });
}

export async function DELETE(request) {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const itemIndex = searchParams.get('itemIndex');
  if (!id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 });

  const [txns, products] = await Promise.all([getTransactions(), getProducts()]);
  const txn = txns.find((t) => t.id === id);
  if (!txn) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });

  if (itemIndex !== null) {
    // Remove a single item from the transaction
    const idx = parseInt(itemIndex);
    const removedItem = txn.items[idx];
    if (!removedItem) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });

    const newItems = txn.items.filter((_, i) => i !== idx);

    // Revert stock for the removed item
    const nextProducts = products.map((p) =>
      p.id === removedItem.productId && p.stock !== null
        ? { ...p, stock: p.stock + removedItem.qty }
        : p
    );

    if (newItems.length === 0) {
      // No items left — delete the whole transaction
      await Promise.all([
        setTransactions(txns.filter((t) => t.id !== id)),
        setProducts(nextProducts),
      ]);
    } else {
      const updatedTxn = { ...txn, items: newItems, total: newItems.reduce((s, i) => s + i.subtotal, 0) };
      await Promise.all([
        setTransactions(txns.map((t) => (t.id === id ? updatedTxn : t))),
        setProducts(nextProducts),
      ]);
    }
  } else {
    // Delete entire transaction and revert all stock
    const nextProducts = products.map((p) => {
      const it = txn.items.find((x) => x.productId === p.id);
      if (it && p.stock !== null) return { ...p, stock: p.stock + it.qty };
      return p;
    });
    await Promise.all([
      setTransactions(txns.filter((t) => t.id !== id)),
      setProducts(nextProducts),
    ]);
  }

  return NextResponse.json({ ok: true });
}
