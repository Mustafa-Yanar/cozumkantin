'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Coffee, Package, Users, LogOut, Plus, Minus, Trash2, Edit3, Save, X,
  Search, ShoppingBag, Receipt, AlertTriangle,
  Lock, User, Wallet, Clock, StickyNote, ChevronRight, BarChart3, Eye, EyeOff, TrendingUp
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, BarChart, Bar
} from 'recharts';

// ========== UTILS ==========
const fmtTL = (n) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2 }).format(n || 0);
const fmtDate = (iso) => new Date(iso).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

async function api(path, opts = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    credentials: 'same-origin',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'İşlem başarısız');
  return data;
}

// ========== MAIN ==========
export default function Page() {
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState('landing');
  const [ownerExists, setOwnerExists] = useState(false);
  const [toast, setToast] = useState(null);
  const [customerProfile, setCustomerProfile] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const status = await api('/api/auth');
        setOwnerExists(status.ownerExists);
        if (status.session?.role === 'owner') setScreen('owner');
        else if (status.session?.role === 'customer') {
          setCustomerProfile({ id: status.session.customerId, name: status.session.name, username: status.session.username });
          setScreen('customer');
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const logout = async () => {
    await api('/api/auth', { method: 'POST', body: JSON.stringify({ action: 'logout' }) });
    setScreen('landing');
    setCustomerProfile(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f5efe0' }}>
        <div className="text-center">
          <Coffee className="w-12 h-12 mx-auto mb-3 animate-pulse" style={{ color: '#8B4513' }} />
          <p style={{ color: '#5C3A1E' }}>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 pointer-events-none opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0.4 0 0 0 0 0.25 0 0 0 0 0.1 0 0 0 0.3 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      <div className="relative z-10">
        {screen === 'landing' && <Landing onPick={setScreen} hasOwner={ownerExists} />}
        {screen === 'owner-login' && (
          <OwnerLogin
            ownerExists={ownerExists}
            onLogin={() => { setOwnerExists(true); setScreen('owner'); }}
            onBack={() => setScreen('landing')}
            showToast={showToast}
          />
        )}
        {screen === 'owner' && (
          <OwnerPanel onLogout={logout} showToast={showToast} />
        )}
        {screen === 'customer-login' && (
          <CustomerLogin
            onLogin={(c) => { setCustomerProfile(c); setScreen('customer'); }}
            onBack={() => setScreen('landing')}
            showToast={showToast}
          />
        )}
        {screen === 'customer' && customerProfile && (
          <CustomerPanel customer={customerProfile} onLogout={logout} />
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded shadow-lg animate-fade-in"
          style={{
            background: toast.type === 'error' ? '#8B2E1E' : '#3D5A2E',
            color: '#f5efe0',
            border: '1px solid rgba(0,0,0,0.2)'
          }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ========== LANDING ==========
function Landing({ onPick, hasOwner }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="text-center mb-12 max-w-2xl">
        <div className="inline-block mb-6 px-4 py-2 rounded" style={{ background: '#8B4513', color: '#f5efe0', transform: 'rotate(-2deg)' }}>
          <span className="text-sm tracking-widest">EST. 2026 — VERESİYE DEFTERİ</span>
        </div>
        <h1 className="text-6xl md:text-7xl mb-4 leading-tight" style={{ color: '#5C3A1E', fontWeight: 'bold', letterSpacing: '-0.02em' }}>
          Çözüm <em style={{ color: '#8B4513' }}>Kantin</em>
        </h1>
        <div className="h-1 w-24 mx-auto mb-6" style={{ background: '#8B4513' }} />
        <p className="text-xl" style={{ color: '#6B4423' }}>
          Eski usul güven, yeni usul defter
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
        <button onClick={() => onPick('owner-login')}
          className="paper-card p-8 text-left transition-all hover:scale-105 ink-shadow rounded">
          <div className="flex items-start justify-between mb-4">
            <Coffee className="w-12 h-12" style={{ color: '#8B4513' }} />
            <span className="text-xs px-2 py-1 rounded" style={{ background: '#8B4513', color: '#f5efe0' }}>YÖNETİCİ</span>
          </div>
          <h2 className="text-2xl mb-2" style={{ color: '#5C3A1E', fontWeight: 'bold' }}>Kantinci Girişi</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#6B4423' }}>
            {hasOwner ? 'Ürünleri, müşterileri ve borçları yönet' : 'İlk kurulum için tıkla — şifre belirle'}
          </p>
          <div className="mt-4 flex items-center text-sm font-semibold" style={{ color: '#8B4513' }}>
            Giriş yap <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </button>

        <button onClick={() => onPick('customer-login')}
          className="paper-card p-8 text-left transition-all hover:scale-105 ink-shadow rounded">
          <div className="flex items-start justify-between mb-4">
            <User className="w-12 h-12" style={{ color: '#3D5A2E' }} />
            <span className="text-xs px-2 py-1 rounded" style={{ background: '#3D5A2E', color: '#f5efe0' }}>MÜŞTERİ</span>
          </div>
          <h2 className="text-2xl mb-2" style={{ color: '#5C3A1E', fontWeight: 'bold' }}>Müşteri Girişi</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#6B4423' }}>
            Borç durumunu ve alışveriş geçmişini görüntüle
          </p>
          <div className="mt-4 flex items-center text-sm font-semibold" style={{ color: '#3D5A2E' }}>
            Hesabı görüntüle <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </button>
      </div>

      <p className="mt-12 text-xs" style={{ color: '#8B7355' }}>
        Veriler bulutta saklanır, her cihazdan erişilebilir.
      </p>
    </div>
  );
}

// ========== OWNER LOGIN ==========
function OwnerLogin({ ownerExists, onLogin, onBack, showToast }) {
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [err, setErr] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const isSetup = !ownerExists;

  const submit = async () => {
    setErr('');
    if (isSetup) {
      if (pwd.length < 4) { setErr('Şifre en az 4 karakter olmalı'); return; }
      if (pwd !== pwd2) { setErr('Şifreler eşleşmiyor'); return; }
    }
    setBusy(true);
    try {
      await api('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ action: isSetup ? 'owner-setup' : 'owner-login', password: pwd }),
      });
      if (isSetup) showToast('Şifre oluşturuldu, hoş geldiniz');
      onLogin();
    } catch (e) {
      setErr(e.message);
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="paper-card p-8 w-full max-w-md ink-shadow rounded">
        <button onClick={onBack} className="text-sm mb-6" style={{ color: '#6B4423' }}>← Geri</button>
        <div className="text-center mb-6">
          <Lock className="w-10 h-10 mx-auto mb-3" style={{ color: '#8B4513' }} />
          <h2 className="text-2xl font-bold" style={{ color: '#5C3A1E' }}>
            {isSetup ? 'İlk Kurulum' : 'Kantinci Girişi'}
          </h2>
          <p className="text-sm mt-2" style={{ color: '#6B4423' }}>
            {isSetup ? 'Yönetici şifrenizi belirleyin' : 'Yönetici şifrenizi girin'}
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={pwd}
              onChange={(e) => { setPwd(e.target.value); setErr(''); }}
              onKeyDown={(e) => e.key === 'Enter' && !isSetup && submit()}
              placeholder="Şifre"
              className="w-full px-4 py-3 pr-12 rounded border-2 outline-none"
              style={{ borderColor: '#8B4513', background: '#fdfaf0', color: '#5C3A1E' }}
              autoFocus
            />
            <button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#8B4513' }}>
              {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {isSetup && (
            <input
              type={show ? 'text' : 'password'}
              value={pwd2}
              onChange={(e) => { setPwd2(e.target.value); setErr(''); }}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="Şifre tekrar"
              className="w-full px-4 py-3 rounded border-2 outline-none"
              style={{ borderColor: '#8B4513', background: '#fdfaf0', color: '#5C3A1E' }}
            />
          )}
          {err && <p className="text-sm" style={{ color: '#8B2E1E' }}>{err}</p>}
          <button onClick={submit} disabled={busy} className="w-full py-3 rounded font-semibold disabled:opacity-60"
            style={{ background: '#8B4513', color: '#f5efe0' }}>
            {busy ? '...' : (isSetup ? 'Şifreyi Belirle' : 'Giriş Yap')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== CUSTOMER LOGIN ==========
function CustomerLogin({ onLogin, onBack, showToast }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setErr('');
    setBusy(true);
    try {
      const r = await api('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ action: 'customer-login', username: u, password: p }),
      });
      onLogin(r.customer);
    } catch (e) {
      setErr(e.message);
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="paper-card p-8 w-full max-w-md ink-shadow rounded">
        <button onClick={onBack} className="text-sm mb-6" style={{ color: '#6B4423' }}>← Geri</button>
        <div className="text-center mb-6">
          <User className="w-10 h-10 mx-auto mb-3" style={{ color: '#3D5A2E' }} />
          <h2 className="text-2xl font-bold" style={{ color: '#5C3A1E' }}>Müşteri Girişi</h2>
          <p className="text-sm mt-2" style={{ color: '#6B4423' }}>Kantincinin verdiği bilgiler ile giriş yapın</p>
        </div>

        <div className="space-y-3">
          <input value={u} onChange={(e) => { setU(e.target.value); setErr(''); }}
            placeholder="Kullanıcı adı"
            className="w-full px-4 py-3 rounded border-2 outline-none"
            style={{ borderColor: '#3D5A2E', background: '#fdfaf0', color: '#5C3A1E' }}
            autoFocus />
          <input type="password" value={p} onChange={(e) => { setP(e.target.value); setErr(''); }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Şifre"
            className="w-full px-4 py-3 rounded border-2 outline-none"
            style={{ borderColor: '#3D5A2E', background: '#fdfaf0', color: '#5C3A1E' }} />
          {err && <p className="text-sm" style={{ color: '#8B2E1E' }}>{err}</p>}
          <button onClick={submit} disabled={busy} className="w-full py-3 rounded font-semibold disabled:opacity-60"
            style={{ background: '#3D5A2E', color: '#f5efe0' }}>
            {busy ? '...' : 'Giriş Yap'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== OWNER PANEL ==========
function OwnerPanel({ onLogout, showToast }) {
  const [tab, setTab] = useState('sale');
  const [data, setData] = useState({ products: [], customers: [], txns: [], payments: [] });
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const r = await api('/api/data');
      setData({
        products: r.products || [],
        customers: r.customers || [],
        txns: r.txns || [],
        payments: r.payments || [],
      });
    } catch (e) {
      showToast(e.message, 'error');
    }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const customerBalance = (cId) => {
    const debt = data.txns.filter(t => t.customerId === cId).reduce((s, t) => s + t.total, 0);
    const paid = data.payments.filter(p => p.customerId === cId).reduce((s, p) => s + p.amount, 0);
    return debt - paid;
  };

  const totalDebt = data.customers.reduce((s, c) => s + customerBalance(c.id), 0);
  const lowStock = data.products.filter(p => p.stock !== null && p.stock <= 5).length;

  return (
    <div className="min-h-screen">
      <header className="border-b-2 px-6 py-4" style={{ borderColor: '#8B4513', background: '#fdfaf0' }}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Coffee className="w-8 h-8" style={{ color: '#8B4513' }} />
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#5C3A1E' }}>Çözüm Kantin · Yönetim</h1>
              <p className="text-xs" style={{ color: '#6B4423' }}>Toplam Açık: <strong>{fmtTL(totalDebt)}</strong> · {data.customers.length} müşteri · {data.products.length} ürün</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 rounded text-sm"
            style={{ background: '#5C3A1E', color: '#f5efe0' }}>
            <LogOut className="w-4 h-4" /> Çıkış
          </button>
        </div>
      </header>

      <nav className="border-b px-6" style={{ borderColor: 'rgba(139, 69, 19, 0.3)', background: '#f5efe0' }}>
        <div className="max-w-7xl mx-auto flex overflow-x-auto">
          {[
            { id: 'sale', label: 'Satış Yap', icon: ShoppingBag },
            { id: 'customers', label: 'Müşteriler', icon: Users },
            { id: 'products', label: 'Ürünler / Stok', icon: Package, badge: lowStock > 0 ? lowStock : null },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-5 py-3 flex items-center gap-2 text-sm font-semibold whitespace-nowrap border-b-2 transition"
              style={{
                borderColor: tab === t.id ? '#8B4513' : 'transparent',
                color: tab === t.id ? '#5C3A1E' : '#8B7355'
              }}>
              <t.icon className="w-4 h-4" /> {t.label}
              {t.badge && <span className="ml-1 px-2 py-0.5 rounded-full text-xs" style={{ background: '#8B2E1E', color: '#f5efe0' }}>{t.badge}</span>}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <p className="text-center py-12" style={{ color: '#8B7355' }}>Yükleniyor...</p>
        ) : (
          <>
            {tab === 'sale' && <SaleTab data={data} customerBalance={customerBalance} refresh={refresh} showToast={showToast} />}
            {tab === 'customers' && <CustomersTab data={data} customerBalance={customerBalance} refresh={refresh} showToast={showToast} />}
            {tab === 'products' && <ProductsTab products={data.products} refresh={refresh} showToast={showToast} />}
          </>
        )}
      </main>
    </div>
  );
}

// ========== SALE TAB ==========
function SaleTab({ data, customerBalance, refresh, showToast }) {
  const { products, customers } = data;
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [paymentMode, setPaymentMode] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [busy, setBusy] = useState(false);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q));
  }, [products, search]);

  const cartTotal = cart.reduce((s, item) => {
    const p = products.find(p => p.id === item.productId);
    return s + (p ? p.price * item.qty : 0);
  }, 0);

  const addToCart = (product) => {
    if (product.stock !== null && product.stock <= 0) {
      showToast('Stok yok!', 'error');
      return;
    }
    const existing = cart.find(i => i.productId === product.id);
    if (existing) {
      if (product.stock !== null && existing.qty >= product.stock) {
        showToast('Stok yetersiz', 'error');
        return;
      }
      setCart(cart.map(i => i.productId === product.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { productId: product.id, qty: 1, note: '' }]);
    }
  };

  const updateQty = (productId, delta) => {
    setCart(cart.map(i => i.productId === productId ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };

  const removeFromCart = (productId) => setCart(cart.filter(i => i.productId !== productId));

  const updateNote = (productId, note) => {
    setCart(cart.map(i => i.productId === productId ? { ...i, note } : i));
  };

  const completeSale = async () => {
    if (!selectedCustomer || cart.length === 0) return;
    setBusy(true);
    try {
      await api('/api/transactions', {
        method: 'POST',
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          items: cart.map(i => ({ productId: i.productId, qty: i.qty, note: i.note })),
        }),
      });
      showToast(`${fmtTL(cartTotal)} veresiyeye kaydedildi`);
      setCart([]);
      setSelectedCustomer(null);
      await refresh();
    } catch (e) {
      showToast(e.message, 'error');
    }
    setBusy(false);
  };

  const recordPayment = async () => {
    const amt = parseFloat(paymentAmount);
    if (!selectedCustomer || !amt || amt <= 0) return;
    setBusy(true);
    try {
      await api('/api/payments', {
        method: 'POST',
        body: JSON.stringify({ customerId: selectedCustomer.id, amount: amt }),
      });
      showToast(`${fmtTL(amt)} ödeme kaydedildi`);
      setPaymentAmount('');
      setPaymentMode(false);
      setSelectedCustomer(null);
      await refresh();
    } catch (e) {
      showToast(e.message, 'error');
    }
    setBusy(false);
  };

  if (customers.length === 0) {
    return (
      <div className="paper-card p-12 text-center ink-shadow rounded">
        <Users className="w-16 h-16 mx-auto mb-4" style={{ color: '#8B7355' }} />
        <h3 className="text-xl font-bold mb-2" style={{ color: '#5C3A1E' }}>Henüz müşteri yok</h3>
        <p style={{ color: '#6B4423' }}>Önce "Müşteriler" sekmesinden müşteri ekleyin.</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="paper-card p-12 text-center ink-shadow rounded">
        <Package className="w-16 h-16 mx-auto mb-4" style={{ color: '#8B7355' }} />
        <h3 className="text-xl font-bold mb-2" style={{ color: '#5C3A1E' }}>Henüz ürün yok</h3>
        <p style={{ color: '#6B4423' }}>Önce "Ürünler / Stok" sekmesinden ürün ekleyin.</p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <div className="paper-card p-5 ink-shadow rounded">
          <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#5C3A1E' }}>
            <User className="w-5 h-5" /> Müşteri Seç
          </h3>
          {!selectedCustomer ? (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {customers.map(c => {
                const bal = customerBalance(c.id);
                return (
                  <button key={c.id} onClick={() => setSelectedCustomer(c)}
                    className="w-full text-left p-3 rounded border transition"
                    style={{ borderColor: 'rgba(139, 69, 19, 0.3)', background: '#fdfaf0' }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold" style={{ color: '#5C3A1E' }}>{c.name}</p>
                        <p className="text-xs" style={{ color: '#8B7355' }}>@{c.username}</p>
                      </div>
                      <span className="text-sm font-bold" style={{ color: bal > 0 ? '#8B2E1E' : '#3D5A2E' }}>
                        {fmtTL(bal)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-3 rounded" style={{ background: '#8B4513', color: '#f5efe0' }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs opacity-80">Seçili müşteri</p>
                  <p className="font-bold text-lg">{selectedCustomer.name}</p>
                  <p className="text-sm opacity-90">Mevcut borç: {fmtTL(customerBalance(selectedCustomer.id))}</p>
                </div>
                <button onClick={() => { setSelectedCustomer(null); setCart([]); setPaymentMode(false); }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setPaymentMode(false)}
                  className="flex-1 py-2 rounded text-sm"
                  style={{ background: !paymentMode ? '#f5efe0' : 'transparent', color: !paymentMode ? '#5C3A1E' : '#f5efe0', border: '1px solid #f5efe0' }}>
                  Satış
                </button>
                <button onClick={() => setPaymentMode(true)}
                  className="flex-1 py-2 rounded text-sm"
                  style={{ background: paymentMode ? '#f5efe0' : 'transparent', color: paymentMode ? '#5C3A1E' : '#f5efe0', border: '1px solid #f5efe0' }}>
                  Ödeme Al
                </button>
              </div>
            </div>
          )}
        </div>

        {selectedCustomer && !paymentMode && (
          <div className="paper-card p-5 ink-shadow rounded">
            <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#5C3A1E' }}>
              <Receipt className="w-5 h-5" /> Sepet
            </h3>
            {cart.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: '#8B7355' }}>Ürün ekleyin →</p>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                  {cart.map(item => {
                    const p = products.find(p => p.id === item.productId);
                    if (!p) return null;
                    return (
                      <div key={item.productId} className="pb-3 border-b" style={{ borderColor: 'rgba(139, 69, 19, 0.15)' }}>
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-sm" style={{ color: '#5C3A1E' }}>{p.name}</p>
                          <button onClick={() => removeFromCart(item.productId)} style={{ color: '#8B2E1E' }}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQty(item.productId, -1)} className="w-7 h-7 rounded flex items-center justify-center" style={{ background: '#f5efe0', color: '#5C3A1E' }}><Minus className="w-3 h-3" /></button>
                            <span className="font-bold w-6 text-center" style={{ color: '#5C3A1E' }}>{item.qty}</span>
                            <button onClick={() => updateQty(item.productId, 1)} className="w-7 h-7 rounded flex items-center justify-center" style={{ background: '#f5efe0', color: '#5C3A1E' }}><Plus className="w-3 h-3" /></button>
                          </div>
                          <span className="text-sm font-bold" style={{ color: '#5C3A1E' }}>{fmtTL(p.price * item.qty)}</span>
                        </div>
                        <input
                          value={item.note}
                          onChange={(e) => updateNote(item.productId, e.target.value)}
                          placeholder="📝 Not (örn: az şekerli)"
                          className="w-full text-xs px-2 py-1 rounded border outline-none"
                          style={{ borderColor: 'rgba(139, 69, 19, 0.3)', background: '#fdfaf0', color: '#5C3A1E' }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="pt-3 border-t-2 flex justify-between items-center mb-3" style={{ borderColor: '#8B4513' }}>
                  <span className="font-bold" style={{ color: '#5C3A1E' }}>TOPLAM</span>
                  <span className="text-xl font-bold" style={{ color: '#8B4513' }}>{fmtTL(cartTotal)}</span>
                </div>
                <button onClick={completeSale} disabled={busy} className="w-full py-3 rounded font-bold disabled:opacity-60"
                  style={{ background: '#3D5A2E', color: '#f5efe0' }}>
                  {busy ? '...' : 'Veresiyeye Yaz'}
                </button>
              </>
            )}
          </div>
        )}

        {selectedCustomer && paymentMode && (
          <div className="paper-card p-5 ink-shadow rounded">
            <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#5C3A1E' }}>
              <Wallet className="w-5 h-5" /> Nakit Ödeme
            </h3>
            <p className="text-sm mb-3" style={{ color: '#6B4423' }}>
              Mevcut borç: <strong>{fmtTL(customerBalance(selectedCustomer.id))}</strong>
            </p>
            <input
              type="number"
              step="0.01"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Ödeme tutarı (₺)"
              className="w-full px-4 py-3 rounded border-2 outline-none mb-3"
              style={{ borderColor: '#3D5A2E', background: '#fdfaf0', color: '#5C3A1E' }}
              autoFocus
            />
            <div className="flex gap-2 mb-3">
              <button onClick={() => setPaymentAmount(customerBalance(selectedCustomer.id).toFixed(2))}
                className="flex-1 py-2 text-sm rounded"
                style={{ background: '#f5efe0', color: '#5C3A1E', border: '1px solid #8B4513' }}>
                Tüm Borcu Kapat
              </button>
            </div>
            <button onClick={recordPayment} disabled={busy} className="w-full py-3 rounded font-bold disabled:opacity-60"
              style={{ background: '#3D5A2E', color: '#f5efe0' }}>
              {busy ? '...' : 'Ödemeyi Kaydet'}
            </button>
          </div>
        )}
      </div>

      <div className="lg:col-span-2">
        <div className="paper-card p-5 ink-shadow rounded">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <h3 className="font-bold flex items-center gap-2" style={{ color: '#5C3A1E' }}>
              <Package className="w-5 h-5" /> Ürünler
            </h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#8B7355' }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Ürün ara..."
                className="pl-9 pr-3 py-2 rounded border outline-none text-sm"
                style={{ borderColor: 'rgba(139, 69, 19, 0.3)', background: '#fdfaf0', color: '#5C3A1E' }} />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.map(p => {
              const outOfStock = p.stock !== null && p.stock <= 0;
              return (
                <button key={p.id} onClick={() => selectedCustomer && !paymentMode && !outOfStock && addToCart(p)}
                  disabled={!selectedCustomer || paymentMode || outOfStock}
                  className="text-left rounded overflow-hidden transition disabled:opacity-50"
                  style={{ background: '#fdfaf0', border: '1px solid rgba(139, 69, 19, 0.3)' }}>
                  <div className="aspect-square overflow-hidden" style={{ background: '#f5efe0' }}>
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-10 h-10" style={{ color: '#8B7355' }} />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="font-semibold text-sm leading-tight" style={{ color: '#5C3A1E' }}>{p.name}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-bold text-sm" style={{ color: '#8B4513' }}>{fmtTL(p.price)}</span>
                      {p.stock !== null && (
                        <span className="text-xs" style={{ color: outOfStock ? '#8B2E1E' : (p.stock <= 5 ? '#B8730E' : '#8B7355') }}>
                          Stok: {p.stock}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {filteredProducts.length === 0 && (
            <p className="text-center py-8" style={{ color: '#8B7355' }}>Ürün bulunamadı</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== CUSTOMERS TAB ==========
function CustomersTab({ data, customerBalance, refresh, showToast }) {
  const { customers, txns, payments } = data;
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [form, setForm] = useState({ name: '', username: '', password: '' });
  const [busy, setBusy] = useState(false);

  const startAdd = () => {
    if (customers.length >= 20) { showToast('En fazla 20 müşteri eklenebilir', 'error'); return; }
    setForm({ name: '', username: '', password: '' });
    setAdding(true);
  };

  const startEdit = (c) => {
    setForm({ name: c.name, username: c.username, password: c.password });
    setEditing(c.id);
  };

  const submit = async () => {
    if (!form.name.trim() || !form.username.trim() || !form.password.trim()) {
      showToast('Tüm alanları doldurun', 'error'); return;
    }
    setBusy(true);
    try {
      if (editing) {
        await api('/api/customers', { method: 'PUT', body: JSON.stringify({ id: editing, ...form }) });
        showToast('Müşteri güncellendi');
        setEditing(null);
      } else {
        await api('/api/customers', { method: 'POST', body: JSON.stringify(form) });
        showToast('Müşteri eklendi');
        setAdding(false);
      }
      await refresh();
    } catch (e) {
      showToast(e.message, 'error');
    }
    setBusy(false);
  };

  const remove = async (c) => {
    if (!confirm(`${c.name} silinsin mi? Tüm geçmiş kayıtları da silinecek.`)) return;
    try {
      await api(`/api/customers?id=${c.id}`, { method: 'DELETE' });
      showToast('Müşteri silindi');
      await refresh();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#5C3A1E' }}>Müşteriler</h2>
          <p className="text-sm" style={{ color: '#6B4423' }}>{customers.length} / 20 müşteri</p>
        </div>
        <button onClick={startAdd} disabled={customers.length >= 20}
          className="px-4 py-2 rounded font-semibold flex items-center gap-2 disabled:opacity-50"
          style={{ background: '#8B4513', color: '#f5efe0' }}>
          <Plus className="w-4 h-4" /> Yeni Müşteri
        </button>
      </div>

      {(adding || editing) && (
        <div className="paper-card p-5 ink-shadow rounded mb-5">
          <h3 className="font-bold mb-3" style={{ color: '#5C3A1E' }}>{editing ? 'Müşteriyi Düzenle' : 'Yeni Müşteri'}</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ad Soyad"
              className="px-3 py-2 rounded border-2 outline-none"
              style={{ borderColor: '#8B4513', background: '#fdfaf0', color: '#5C3A1E' }} />
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Kullanıcı adı"
              className="px-3 py-2 rounded border-2 outline-none"
              style={{ borderColor: '#8B4513', background: '#fdfaf0', color: '#5C3A1E' }} />
            <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Şifre"
              className="px-3 py-2 rounded border-2 outline-none"
              style={{ borderColor: '#8B4513', background: '#fdfaf0', color: '#5C3A1E' }} />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={submit} disabled={busy} className="px-4 py-2 rounded font-semibold flex items-center gap-2 disabled:opacity-60"
              style={{ background: '#3D5A2E', color: '#f5efe0' }}>
              <Save className="w-4 h-4" /> Kaydet
            </button>
            <button onClick={() => { setAdding(false); setEditing(null); }}
              className="px-4 py-2 rounded font-semibold"
              style={{ background: '#f5efe0', color: '#5C3A1E', border: '1px solid #8B4513' }}>
              İptal
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map(c => {
          const bal = customerBalance(c.id);
          const cTxns = txns.filter(t => t.customerId === c.id);
          const cPays = payments.filter(p => p.customerId === c.id);
          return (
            <div key={c.id} className="paper-card p-4 ink-shadow rounded">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate" style={{ color: '#5C3A1E' }}>{c.name}</p>
                  <p className="text-xs" style={{ color: '#8B7355' }}>@{c.username}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setViewing(c)} className="p-1.5 rounded" style={{ background: '#f5efe0', color: '#8B4513' }}>
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => startEdit(c)} className="p-1.5 rounded" style={{ background: '#f5efe0', color: '#8B4513' }}>
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(c)} className="p-1.5 rounded" style={{ background: '#f5efe0', color: '#8B2E1E' }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(139, 69, 19, 0.15)' }}>
                <div className="flex justify-between text-xs mb-1" style={{ color: '#6B4423' }}>
                  <span>{cTxns.length} alışveriş · {cPays.length} ödeme</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs" style={{ color: '#6B4423' }}>Borç</span>
                  <span className="text-xl font-bold" style={{ color: bal > 0 ? '#8B2E1E' : '#3D5A2E' }}>{fmtTL(bal)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {customers.length === 0 && !adding && (
        <div className="paper-card p-12 text-center ink-shadow rounded">
          <Users className="w-16 h-16 mx-auto mb-4" style={{ color: '#8B7355' }} />
          <h3 className="text-xl font-bold mb-2" style={{ color: '#5C3A1E' }}>Henüz müşteri yok</h3>
          <p className="mb-4" style={{ color: '#6B4423' }}>"Yeni Müşteri" ile başlayın</p>
        </div>
      )}

      {viewing && (
        <CustomerHistoryModal
          customer={viewing}
          txns={txns.filter(t => t.customerId === viewing.id)}
          payments={payments.filter(p => p.customerId === viewing.id)}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
}

// ========== CUSTOMER HISTORY MODAL ==========
function CustomerHistoryModal({ customer, txns, payments, onClose }) {
  const combined = useMemo(() => {
    const all = [
      ...txns.map(t => ({ type: 'sale', ...t })),
      ...payments.map(p => ({ type: 'payment', ...p })),
    ];
    return all.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [txns, payments]);

  const totalDebt = txns.reduce((s, t) => s + t.total, 0);
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(92, 58, 30, 0.7)' }} onClick={onClose}>
      <div className="paper-card max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col ink-shadow rounded" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b-2 flex justify-between items-start" style={{ borderColor: '#8B4513' }}>
          <div>
            <h3 className="text-xl font-bold" style={{ color: '#5C3A1E' }}>{customer.name}</h3>
            <p className="text-xs" style={{ color: '#8B7355' }}>@{customer.username}</p>
            <div className="flex gap-4 mt-2 text-sm">
              <span style={{ color: '#8B2E1E' }}>Toplam alışveriş: <strong>{fmtTL(totalDebt)}</strong></span>
              <span style={{ color: '#3D5A2E' }}>Toplam ödeme: <strong>{fmtTL(totalPaid)}</strong></span>
            </div>
            <p className="text-lg font-bold mt-1" style={{ color: (totalDebt - totalPaid) > 0 ? '#8B2E1E' : '#3D5A2E' }}>
              Bakiye: {fmtTL(totalDebt - totalPaid)}
            </p>
          </div>
          <button onClick={onClose}><X className="w-6 h-6" style={{ color: '#5C3A1E' }} /></button>
        </div>
        <div className="overflow-y-auto p-5">
          {combined.length === 0 ? (
            <p className="text-center py-8" style={{ color: '#8B7355' }}>Henüz kayıt yok</p>
          ) : (
            <div className="space-y-3">
              {combined.map(rec => (
                <div key={rec.id} className="p-3 rounded border" style={{ borderColor: 'rgba(139, 69, 19, 0.2)', background: rec.type === 'payment' ? '#f0f5e8' : '#fdfaf0' }}>
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      {rec.type === 'sale' ? <ShoppingBag className="w-4 h-4" style={{ color: '#8B2E1E' }} /> : <Wallet className="w-4 h-4" style={{ color: '#3D5A2E' }} />}
                      <span className="text-xs" style={{ color: '#6B4423' }}>{fmtDate(rec.date)}</span>
                    </div>
                    <span className="font-bold" style={{ color: rec.type === 'sale' ? '#8B2E1E' : '#3D5A2E' }}>
                      {rec.type === 'sale' ? '+' : '-'}{fmtTL(rec.type === 'sale' ? rec.total : rec.amount)}
                    </span>
                  </div>
                  {rec.type === 'sale' && (
                    <div className="ml-6 mt-2 space-y-1 text-sm">
                      {rec.items.map((it, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between" style={{ color: '#5C3A1E' }}>
                            <span>{it.qty}× {it.productName}</span>
                            <span>{fmtTL(it.subtotal)}</span>
                          </div>
                          {it.note && <p className="text-xs italic ml-2" style={{ color: '#8B7355' }}>📝 {it.note}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                  {rec.type === 'payment' && (
                    <p className="ml-6 text-sm" style={{ color: '#3D5A2E' }}>Nakit ödeme alındı</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== PRODUCTS TAB ==========
function ProductsTab({ products, refresh, showToast }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', stock: '', image: '', trackStock: true });
  const [busy, setBusy] = useState(false);

  const startAdd = () => {
    setForm({ name: '', price: '', stock: '', image: '', trackStock: true });
    setAdding(true);
  };

  const startEdit = (p) => {
    setForm({
      name: p.name, price: p.price.toString(),
      stock: p.stock !== null ? p.stock.toString() : '',
      image: p.image || '', trackStock: p.stock !== null,
    });
    setEditing(p.id);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500 * 1024) { showToast('Görsel 500KB altında olmalı', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, image: reader.result });
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (!form.name.trim() || !form.price) { showToast('İsim ve fiyat zorunlu', 'error'); return; }
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) { showToast('Geçerli bir fiyat girin', 'error'); return; }
    const stock = form.trackStock ? parseInt(form.stock) || 0 : null;

    setBusy(true);
    try {
      const payload = { name: form.name, price, stock, image: form.image };
      if (editing) {
        await api('/api/products', { method: 'PUT', body: JSON.stringify({ id: editing, ...payload }) });
        showToast('Ürün güncellendi');
        setEditing(null);
      } else {
        await api('/api/products', { method: 'POST', body: JSON.stringify(payload) });
        showToast('Ürün eklendi');
        setAdding(false);
      }
      await refresh();
    } catch (e) {
      showToast(e.message, 'error');
    }
    setBusy(false);
  };

  const remove = async (p) => {
    if (!confirm(`${p.name} silinsin mi?`)) return;
    try {
      await api(`/api/products?id=${p.id}`, { method: 'DELETE' });
      showToast('Ürün silindi');
      await refresh();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const adjustStock = async (p, delta) => {
    try {
      await api('/api/products', { method: 'PATCH', body: JSON.stringify({ id: p.id, delta }) });
      await refresh();
    } catch (e) { showToast(e.message, 'error'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#5C3A1E' }}>Ürünler & Stok</h2>
          <p className="text-sm" style={{ color: '#6B4423' }}>{products.length} ürün</p>
        </div>
        <button onClick={startAdd} className="px-4 py-2 rounded font-semibold flex items-center gap-2"
          style={{ background: '#8B4513', color: '#f5efe0' }}>
          <Plus className="w-4 h-4" /> Yeni Ürün
        </button>
      </div>

      {(adding || editing) && (
        <div className="paper-card p-5 ink-shadow rounded mb-5">
          <h3 className="font-bold mb-3" style={{ color: '#5C3A1E' }}>{editing ? 'Ürünü Düzenle' : 'Yeni Ürün'}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold block mb-1" style={{ color: '#5C3A1E' }}>Ürün adı</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded border-2 outline-none"
                  style={{ borderColor: '#8B4513', background: '#fdfaf0', color: '#5C3A1E' }} />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1" style={{ color: '#5C3A1E' }}>Fiyat (₺)</label>
                <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-3 py-2 rounded border-2 outline-none"
                  style={{ borderColor: '#8B4513', background: '#fdfaf0', color: '#5C3A1E' }} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="trackStock" checked={form.trackStock}
                  onChange={(e) => setForm({ ...form, trackStock: e.target.checked })} />
                <label htmlFor="trackStock" className="text-sm" style={{ color: '#5C3A1E' }}>Stok takibi yap</label>
              </div>
              {form.trackStock && (
                <div>
                  <label className="text-sm font-semibold block mb-1" style={{ color: '#5C3A1E' }}>Stok adedi</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-3 py-2 rounded border-2 outline-none"
                    style={{ borderColor: '#8B4513', background: '#fdfaf0', color: '#5C3A1E' }} />
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1" style={{ color: '#5C3A1E' }}>Ürün görseli</label>
              <div className="aspect-square rounded border-2 border-dashed flex items-center justify-center mb-2 overflow-hidden"
                style={{ borderColor: '#8B4513', background: '#fdfaf0' }}>
                {form.image ? <img src={form.image} alt="" className="w-full h-full object-cover" /> : <Package className="w-16 h-16" style={{ color: '#8B7355' }} />}
              </div>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm" />
              {form.image && (
                <button onClick={() => setForm({ ...form, image: '' })} className="mt-1 text-xs" style={{ color: '#8B2E1E' }}>
                  Görseli kaldır
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={submit} disabled={busy} className="px-4 py-2 rounded font-semibold flex items-center gap-2 disabled:opacity-60"
              style={{ background: '#3D5A2E', color: '#f5efe0' }}>
              <Save className="w-4 h-4" /> Kaydet
            </button>
            <button onClick={() => { setAdding(false); setEditing(null); }}
              className="px-4 py-2 rounded font-semibold"
              style={{ background: '#f5efe0', color: '#5C3A1E', border: '1px solid #8B4513' }}>
              İptal
            </button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => {
          const lowStock = p.stock !== null && p.stock <= 5;
          const outOfStock = p.stock !== null && p.stock <= 0;
          return (
            <div key={p.id} className="paper-card ink-shadow rounded overflow-hidden">
              <div className="aspect-video overflow-hidden" style={{ background: '#f5efe0' }}>
                {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12" style={{ color: '#8B7355' }} />
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate" style={{ color: '#5C3A1E' }}>{p.name}</p>
                    <p className="text-sm font-bold" style={{ color: '#8B4513' }}>{fmtTL(p.price)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(p)} className="p-1.5 rounded" style={{ background: '#f5efe0', color: '#8B4513' }}>
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => remove(p)} className="p-1.5 rounded" style={{ background: '#f5efe0', color: '#8B2E1E' }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {p.stock !== null ? (
                  <div className="flex items-center justify-between mt-2 pt-2 border-t" style={{ borderColor: 'rgba(139, 69, 19, 0.15)' }}>
                    <button onClick={() => adjustStock(p, -1)} className="w-7 h-7 rounded flex items-center justify-center" style={{ background: '#f5efe0', color: '#5C3A1E' }}>
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold flex items-center gap-1" style={{ color: outOfStock ? '#8B2E1E' : (lowStock ? '#B8730E' : '#5C3A1E') }}>
                      {(lowStock || outOfStock) && <AlertTriangle className="w-3 h-3" />}
                      Stok: {p.stock}
                    </span>
                    <button onClick={() => adjustStock(p, 1)} className="w-7 h-7 rounded flex items-center justify-center" style={{ background: '#f5efe0', color: '#5C3A1E' }}>
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs mt-2 pt-2 border-t" style={{ borderColor: 'rgba(139, 69, 19, 0.15)', color: '#8B7355' }}>Stok takibi yok</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 0 && !adding && (
        <div className="paper-card p-12 text-center ink-shadow rounded">
          <Package className="w-16 h-16 mx-auto mb-4" style={{ color: '#8B7355' }} />
          <h3 className="text-xl font-bold mb-2" style={{ color: '#5C3A1E' }}>Henüz ürün yok</h3>
          <p className="mb-4" style={{ color: '#6B4423' }}>"Yeni Ürün" ile başlayın</p>
        </div>
      )}
    </div>
  );
}

// ========== REPORTS TAB ==========
function ReportsTab({ data, customerBalance }) {
  const { customers, txns, payments } = data;
  const [selectedCustomerId, setSelectedCustomerId] = useState('all');

  const monthlyData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = new Date(now.getFullYear(), now.getMonth() - i, 1).toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' });

      const filterFn = selectedCustomerId === 'all' ? () => true : (x) => x.customerId === selectedCustomerId;
      const monthSales = txns.filter(t => filterFn(t) && new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd).reduce((s, t) => s + t.total, 0);
      const monthPays = payments.filter(p => filterFn(p) && new Date(p.date) >= monthStart && new Date(p.date) <= monthEnd).reduce((s, p) => s + p.amount, 0);

      months.push({ name: monthLabel, alışveriş: Math.round(monthSales * 100) / 100, ödeme: Math.round(monthPays * 100) / 100 });
    }
    return months;
  }, [txns, payments, selectedCustomerId]);

  const topProducts = useMemo(() => {
    const filterFn = selectedCustomerId === 'all' ? () => true : (t) => t.customerId === selectedCustomerId;
    const map = {};
    txns.filter(filterFn).forEach(t => {
      t.items.forEach(it => {
        map[it.productName] = (map[it.productName] || 0) + it.qty;
      });
    });
    return Object.entries(map).map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [txns, selectedCustomerId]);

  const exportCSV = () => {
    const filterFn = selectedCustomerId === 'all' ? () => true : (x) => x.customerId === selectedCustomerId;
    const rows = [['Tarih', 'Müşteri', 'İşlem Tipi', 'Açıklama', 'Tutar (TL)']];
    txns.filter(filterFn).forEach(t => {
      const c = customers.find(x => x.id === t.customerId);
      const desc = t.items.map(it => `${it.qty}x ${it.productName}${it.note ? ` (${it.note})` : ''}`).join('; ');
      rows.push([fmtDate(t.date), c?.name || '?', 'Alışveriş', desc, t.total.toFixed(2)]);
    });
    payments.filter(filterFn).forEach(p => {
      const c = customers.find(x => x.id === p.customerId);
      rows.push([fmtDate(p.date), c?.name || '?', 'Ödeme', 'Nakit ödeme', `-${p.amount.toFixed(2)}`]);
    });
    rows.sort((a, b) => a[0] > b[0] ? -1 : 1);
    const csv = '\uFEFF' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kantin-rapor-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const filterFn = selectedCustomerId === 'all' ? () => true : (x) => x.customerId === selectedCustomerId;
    const customerName = selectedCustomerId === 'all' ? 'Tüm Müşteriler' : customers.find(c => c.id === selectedCustomerId)?.name || '';
    const allRecs = [
      ...txns.filter(filterFn).map(t => ({ ...t, type: 'sale' })),
      ...payments.filter(filterFn).map(p => ({ ...p, type: 'payment' })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalSales = txns.filter(filterFn).reduce((s, t) => s + t.total, 0);
    const totalPays = payments.filter(filterFn).reduce((s, p) => s + p.amount, 0);

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Kantin Raporu</title>
<style>body{font-family:Georgia,serif;background:#f5efe0;color:#5C3A1E;padding:30px;max-width:800px;margin:auto}h1{border-bottom:2px solid #8B4513;padding-bottom:8px}.summary{background:#fdfaf0;padding:15px;border:1px solid #8B4513;margin:20px 0}table{width:100%;border-collapse:collapse;margin-top:15px}th,td{padding:8px;text-align:left;border-bottom:1px solid #ddd;font-size:12px}th{background:#8B4513;color:#f5efe0}.sale{color:#8B2E1E}.payment{color:#3D5A2E}.note{font-style:italic;color:#8B7355;font-size:11px}@media print{body{background:white}}</style></head><body>
<h1>Çözüm Kantin · Veresiye Raporu</h1>
<p><strong>Müşteri:</strong> ${customerName}<br><strong>Rapor tarihi:</strong> ${fmtDate(new Date().toISOString())}</p>
<div class="summary">
<p><strong>Toplam Alışveriş:</strong> ${fmtTL(totalSales)}</p>
<p><strong>Toplam Ödeme:</strong> ${fmtTL(totalPays)}</p>
<p style="font-size:18px;"><strong>Açık Bakiye: ${fmtTL(totalSales - totalPays)}</strong></p>
</div>
<table><thead><tr><th>Tarih</th><th>Müşteri</th><th>İşlem</th><th>Detay</th><th>Tutar</th></tr></thead><tbody>
${allRecs.map(r => {
  const c = customers.find(x => x.id === r.customerId);
  if (r.type === 'sale') {
    const detail = r.items.map(it => `${it.qty}× ${it.productName}${it.note ? ` <span class="note">(${it.note})</span>` : ''}`).join('<br>');
    return `<tr><td>${fmtDate(r.date)}</td><td>${c?.name || '?'}</td><td class="sale">Alışveriş</td><td>${detail}</td><td class="sale">+${fmtTL(r.total)}</td></tr>`;
  } else {
    return `<tr><td>${fmtDate(r.date)}</td><td>${c?.name || '?'}</td><td class="payment">Ödeme</td><td>Nakit ödeme</td><td class="payment">-${fmtTL(r.amount)}</td></tr>`;
  }
}).join('')}
</tbody></table><script>window.onload=()=>window.print();</script></body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
  };

  const sortedCustomers = [...customers].sort((a, b) => customerBalance(b.id) - customerBalance(a.id));

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-5 gap-3">
        <h2 className="text-2xl font-bold" style={{ color: '#5C3A1E' }}>Raporlar & Analiz</h2>
        <div className="flex gap-2 flex-wrap">
          <select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="px-3 py-2 rounded border-2 outline-none text-sm"
            style={{ borderColor: '#8B4513', background: '#fdfaf0', color: '#5C3A1E' }}>
            <option value="all">Tüm Müşteriler</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={exportCSV} className="px-3 py-2 rounded text-sm flex items-center gap-1 font-semibold"
            style={{ background: '#3D5A2E', color: '#f5efe0' }}>
            <FileDown className="w-4 h-4" /> Excel (CSV)
          </button>
          <button onClick={exportPDF} className="px-3 py-2 rounded text-sm flex items-center gap-1 font-semibold"
            style={{ background: '#8B4513', color: '#f5efe0' }}>
            <FileDown className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <div className="paper-card p-5 ink-shadow rounded">
          <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#5C3A1E' }}>
            <TrendingUp className="w-5 h-5" /> Son 6 Ay — Alışveriş & Ödeme
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,69,19,0.2)" />
              <XAxis dataKey="name" tick={{ fill: '#5C3A1E', fontSize: 12 }} />
              <YAxis tick={{ fill: '#5C3A1E', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#fdfaf0', border: '1px solid #8B4513' }} formatter={(v) => fmtTL(v)} />
              <Bar dataKey="alışveriş" fill="#8B2E1E" />
              <Bar dataKey="ödeme" fill="#3D5A2E" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="paper-card p-5 ink-shadow rounded">
          <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#5C3A1E' }}>
            <Package className="w-5 h-5" /> En Çok Satan Ürünler
          </h3>
          {topProducts.length === 0 ? (
            <p className="text-center py-8" style={{ color: '#8B7355' }}>Henüz veri yok</p>
          ) : (
            <div className="space-y-2">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="font-bold w-6 text-center" style={{ color: '#8B4513' }}>#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: '#5C3A1E' }}>{p.name}</p>
                    <div className="h-2 rounded mt-1" style={{ background: '#f5efe0' }}>
                      <div className="h-full rounded" style={{ width: `${(p.qty / topProducts[0].qty) * 100}%`, background: '#8B4513' }} />
                    </div>
                  </div>
                  <span className="font-bold" style={{ color: '#5C3A1E' }}>{p.qty} adet</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedCustomerId === 'all' && (
        <div className="paper-card p-5 ink-shadow rounded">
          <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#5C3A1E' }}>
            <Users className="w-5 h-5" /> Müşteri Bakiye Sıralaması
          </h3>
          <div className="space-y-2">
            {sortedCustomers.map(c => {
              const bal = customerBalance(c.id);
              return (
                <div key={c.id} className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'rgba(139,69,19,0.15)' }}>
                  <span className="font-semibold" style={{ color: '#5C3A1E' }}>{c.name}</span>
                  <span className="font-bold" style={{ color: bal > 0 ? '#8B2E1E' : '#3D5A2E' }}>{fmtTL(bal)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ========== CUSTOMER PANEL ==========
function CustomerPanel({ customer, onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await api('/api/data');
        setData(r);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const combined = useMemo(() => {
    if (!data) return [];
    const all = [
      ...data.txns.map(t => ({ type: 'sale', ...t })),
      ...data.payments.map(p => ({ type: 'payment', ...p })),
    ];
    return all.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [data]);

  const monthlyHistory = useMemo(() => {
    if (!data) return [];
    const months = [];
    const now = new Date();
    const all = [
      ...data.txns.map(t => ({ d: t.date, v: t.total })),
      ...data.payments.map(p => ({ d: p.date, v: -p.amount })),
    ].sort((a, b) => new Date(a.d) - new Date(b.d));
    for (let i = 5; i >= 0; i--) {
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const cumulative = all.filter(x => new Date(x.d) <= monthEnd).reduce((s, x) => s + x.v, 0);
      const monthLabel = new Date(now.getFullYear(), now.getMonth() - i, 1).toLocaleDateString('tr-TR', { month: 'short' });
      months.push({ name: monthLabel, bakiye: Math.max(0, Math.round(cumulative * 100) / 100) });
    }
    return months;
  }, [data]);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: '#5C3A1E' }}>Yükleniyor...</p>
      </div>
    );
  }

  const totalDebt = data.txns.reduce((s, t) => s + t.total, 0);
  const totalPaid = data.payments.reduce((s, p) => s + p.amount, 0);
  const balance = totalDebt - totalPaid;

  return (
    <div>
      <header className="border-b-2 px-6 py-4" style={{ borderColor: '#3D5A2E', background: '#fdfaf0' }}>
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8" style={{ color: '#3D5A2E' }} />
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#5C3A1E' }}>Hoş geldiniz, {customer.name}</h1>
              <p className="text-xs" style={{ color: '#6B4423' }}>@{customer.username}</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 rounded text-sm"
            style={{ background: '#5C3A1E', color: '#f5efe0' }}>
            <LogOut className="w-4 h-4" /> Çıkış
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-5">
        <div className="relative paper-card p-8 ink-shadow rounded text-center overflow-hidden">
          {balance <= 0 && combined.length > 0 && (
            <div className="absolute top-4 right-4 stamp" style={{
              border: '4px solid #3D5A2E', color: '#3D5A2E',
              padding: '8px 20px', fontWeight: 'bold', fontSize: '20px',
              letterSpacing: '2px', transform: 'rotate(-6deg)',
              background: 'rgba(61, 90, 46, 0.05)'
            }}>
              ÖDENDİ
            </div>
          )}
          <p className="text-sm uppercase tracking-widest mb-2" style={{ color: '#6B4423' }}>Mevcut Borç</p>
          <p className="text-6xl font-bold mb-3" style={{ color: balance > 0 ? '#8B2E1E' : '#3D5A2E' }}>
            {fmtTL(balance)}
          </p>
          <div className="flex justify-center gap-6 text-sm" style={{ color: '#6B4423' }}>
            <div>
              <p className="opacity-70">Toplam Alışveriş</p>
              <p className="font-bold text-base" style={{ color: '#8B2E1E' }}>{fmtTL(totalDebt)}</p>
            </div>
            <div>
              <p className="opacity-70">Toplam Ödeme</p>
              <p className="font-bold text-base" style={{ color: '#3D5A2E' }}>{fmtTL(totalPaid)}</p>
            </div>
          </div>
        </div>

        {combined.length > 0 && (
          <div className="paper-card p-5 ink-shadow rounded">
            <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#5C3A1E' }}>
              <BarChart3 className="w-5 h-5" /> Son 6 Ay — Bakiye Seyri
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,69,19,0.2)" />
                <XAxis dataKey="name" tick={{ fill: '#5C3A1E', fontSize: 12 }} />
                <YAxis tick={{ fill: '#5C3A1E', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#fdfaf0', border: '1px solid #8B4513' }} formatter={(v) => fmtTL(v)} />
                <Line type="monotone" dataKey="bakiye" stroke="#8B4513" strokeWidth={3} dot={{ fill: '#8B4513', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="paper-card p-5 ink-shadow rounded">
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#5C3A1E' }}>
            <Clock className="w-5 h-5" /> İşlem Geçmişi
          </h3>
          {combined.length === 0 ? (
            <p className="text-center py-8" style={{ color: '#8B7355' }}>Henüz işlem yok</p>
          ) : (
            <div className="space-y-3">
              {combined.map(rec => (
                <div key={rec.id} className="p-4 rounded border" style={{ borderColor: 'rgba(139, 69, 19, 0.2)', background: rec.type === 'payment' ? '#f0f5e8' : '#fdfaf0' }}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {rec.type === 'sale' ? <ShoppingBag className="w-5 h-5" style={{ color: '#8B2E1E' }} /> : <Wallet className="w-5 h-5" style={{ color: '#3D5A2E' }} />}
                      <div>
                        <p className="font-semibold" style={{ color: '#5C3A1E' }}>
                          {rec.type === 'sale' ? 'Alışveriş' : 'Nakit Ödeme'}
                        </p>
                        <p className="text-xs" style={{ color: '#6B4423' }}>{fmtDate(rec.date)}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold" style={{ color: rec.type === 'sale' ? '#8B2E1E' : '#3D5A2E' }}>
                      {rec.type === 'sale' ? '+' : '-'}{fmtTL(rec.type === 'sale' ? rec.total : rec.amount)}
                    </span>
                  </div>
                  {rec.type === 'sale' && (
                    <div className="mt-2 pt-2 border-t space-y-1.5 text-sm" style={{ borderColor: 'rgba(139, 69, 19, 0.1)' }}>
                      {rec.items.map((it, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between" style={{ color: '#5C3A1E' }}>
                            <span><strong>{it.qty}×</strong> {it.productName}</span>
                            <span>{fmtTL(it.subtotal)}</span>
                          </div>
                          {it.note && (
                            <p className="text-xs italic ml-4 mt-0.5 flex items-start gap-1" style={{ color: '#8B7355' }}>
                              <StickyNote className="w-3 h-3 mt-0.5 flex-shrink-0" /> {it.note}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
