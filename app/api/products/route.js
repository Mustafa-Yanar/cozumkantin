import { NextResponse } from 'next/server';
import { getProducts, setProducts } from '@/lib/kv';
import { requireOwner } from '@/lib/auth';

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export async function GET() {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const products = await getProducts();
  return NextResponse.json({ products });
}

export async function POST(request) {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const body = await request.json();
  const products = await getProducts();
  if (!body.name || body.price == null) {
    return NextResponse.json({ error: 'İsim ve fiyat zorunlu' }, { status: 400 });
  }
  const newProduct = {
    id: uid(),
    name: body.name,
    price: parseFloat(body.price),
    stock: body.stock === null || body.stock === undefined ? null : parseInt(body.stock) || 0,
    image: body.image || '',
  };
  const next = [...products, newProduct];
  await setProducts(next);
  return NextResponse.json({ product: newProduct });
}

export async function PUT(request) {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const body = await request.json();
  const products = await getProducts();
  const idx = products.findIndex((p) => p.id === body.id);
  if (idx < 0) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });
  const updated = {
    ...products[idx],
    name: body.name ?? products[idx].name,
    price: body.price != null ? parseFloat(body.price) : products[idx].price,
    stock: body.stock === null ? null : body.stock !== undefined ? parseInt(body.stock) : products[idx].stock,
    image: body.image !== undefined ? body.image : products[idx].image,
  };
  const next = [...products];
  next[idx] = updated;
  await setProducts(next);
  return NextResponse.json({ product: updated });
}

export async function DELETE(request) {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 });
  const products = await getProducts();
  await setProducts(products.filter((p) => p.id !== id));
  return NextResponse.json({ ok: true });
}

// PATCH: stock adjust delta (+/-)
export async function PATCH(request) {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const body = await request.json();
  const { id, delta } = body;
  const products = await getProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx < 0) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });
  if (products[idx].stock === null) {
    return NextResponse.json({ error: 'Bu üründe stok takibi yok' }, { status: 400 });
  }
  const next = [...products];
  next[idx] = { ...next[idx], stock: Math.max(0, next[idx].stock + delta) };
  await setProducts(next);
  return NextResponse.json({ product: next[idx] });
}
