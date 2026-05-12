import { Redis } from '@upstash/redis';

const kv = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const KEYS = {
  owner: 'owner_pwd_hash',
  products: 'products_list',
  customers: 'customers_list',
  txns: 'transactions_log',
  payments: 'payments_log',
};

export async function getOwnerHash() {
  return await kv.get(KEYS.owner);
}

export async function setOwnerHash(hash) {
  return await kv.set(KEYS.owner, hash);
}

export async function getProducts() {
  return (await kv.get(KEYS.products)) || [];
}

export async function setProducts(list) {
  return await kv.set(KEYS.products, list);
}

export async function getCustomers() {
  return (await kv.get(KEYS.customers)) || [];
}

export async function setCustomers(list) {
  return await kv.set(KEYS.customers, list);
}

export async function getTransactions() {
  return (await kv.get(KEYS.txns)) || [];
}

export async function setTransactions(list) {
  return await kv.set(KEYS.txns, list);
}

export async function getPayments() {
  return (await kv.get(KEYS.payments)) || [];
}

export async function setPayments(list) {
  return await kv.set(KEYS.payments, list);
}

export async function getAllData() {
  const [products, customers, txns, payments] = await Promise.all([
    getProducts(),
    getCustomers(),
    getTransactions(),
    getPayments(),
  ]);
  return { products, customers, txns, payments };
}
