'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Coffee, Package, Users, LogOut, Plus, Minus, Trash2, Edit3, Save, X,
  Search, ShoppingBag, Receipt, AlertTriangle,
  Lock, User, Wallet, Clock, StickyNote, ChevronRight, BarChart3, Eye, EyeOff, TrendingUp
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {screen === 'landing' && <Landing onPick={setScreen} hasOwner={ownerExists} />}
      {screen === 'owner-login' && (
        <OwnerLogin
          ownerExists={ownerExists}
          onLogin={() => { setOwnerExists(true); setScreen('owner'); }}
          onBack={() => setScreen('landing')}
          showToast={showToast}
        />
      )}
      {screen === 'owner' && <OwnerPanel onLogout={logout} showToast={showToast} />}
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

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-medium animate-fade-up"
          style={{
            background: toast.type === 'error' ? '#ef4444' : '#22c55e',
            color: 'white',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            whiteSpace: 'nowrap',
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
    <div className="h-screen flex flex-col items-center justify-center px-6">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
          style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}>
          <Coffee className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-5xl font-extrabold mb-2 tracking-tight" style={{ color: '#1a1d2e' }}>
          Çözüm <span style={{ color: '#6366f1' }}>Kantin</span>
        </h1>
        <p className="text-gray-500 text-base">Veresiye takip sistemi</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 w-full max-w-2xl">
        <button onClick={() => onPick('owner-login')}
          className="card p-7 text-left transition-all duration-200 hover:scale-[1.02] hover:border-indigo-500/30 group"
          style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(99,102,241,0.15)' }}>
            <Lock className="w-5 h-5" style={{ color: '#6366f1' }} />
          </div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-gray-800">Kantinci Girişi</h2>
            <span className="badge" style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>YÖNETİCİ</span>
          </div>
          <p className="text-sm text-gray-500">
            {hasOwner ? 'Ürünleri, müşterileri ve borçları yönet' : 'İlk kurulum — şifreni belirle'}
          </p>
          <div className="flex items-center gap-1 mt-4 text-sm font-semibold" style={{ color: '#6366f1' }}>
            Giriş yap <ChevronRight className="w-4 h-4" />
          </div>
        </button>

        <button onClick={() => onPick('customer-login')}
          className="card p-7 text-left transition-all duration-200 hover:scale-[1.02] hover:border-emerald-500/30 group"
          style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(34,197,94,0.15)' }}>
            <User className="w-5 h-5" style={{ color: '#22c55e' }} />
          </div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-gray-800">Müşteri Girişi</h2>
            <span className="badge" style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>MÜŞTERİ</span>
          </div>
          <p className="text-sm text-gray-500">Borç durumunu ve alışveriş geçmişini görüntüle</p>
          <div className="flex items-center gap-1 mt-4 text-sm font-semibold" style={{ color: '#22c55e' }}>
            Hesabı görüntüle <ChevronRight className="w-4 h-4" />
          </div>
        </button>
      </div>
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
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="card-elevated p-8 w-full max-w-sm">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-300 mb-6 flex items-center gap-1 transition-colors">
          ← Geri
        </button>
        <div className="text-center mb-7">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 6px 20px rgba(99,102,241,0.4)' }}>
            <Lock className="w-6 h-6 text-gray-800" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">{isSetup ? 'İlk Kurulum' : 'Kantinci Girişi'}</h2>
          <p className="text-sm text-gray-500 mt-1">{isSetup ? 'Yönetici şifrenizi belirleyin' : 'Yönetici şifrenizi girin'}</p>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <input type={show ? 'text' : 'password'} value={pwd}
              onChange={(e) => { setPwd(e.target.value); setErr(''); }}
              onKeyDown={(e) => e.key === 'Enter' && !isSetup && submit()}
              placeholder="Şifre" className="input pr-11" autoFocus />
            <button onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {isSetup && (
            <input type={show ? 'text' : 'password'} value={pwd2}
              onChange={(e) => { setPwd2(e.target.value); setErr(''); }}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="Şifre tekrar" className="input" />
          )}
          {err && <p className="text-sm text-red-400">{err}</p>}
          <button onClick={submit} disabled={busy} className="btn-primary w-full py-3">
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
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="card-elevated p-8 w-full max-w-sm">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-300 mb-6 flex items-center gap-1 transition-colors">
          ← Geri
        </button>
        <div className="text-center mb-7">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 6px 20px rgba(34,197,94,0.35)' }}>
            <User className="w-6 h-6 text-gray-800" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Müşteri Girişi</h2>
          <p className="text-sm text-gray-500 mt-1">Kantincinin verdiği bilgiler ile giriş yapın</p>
        </div>

        <div className="space-y-3">
          <input value={u} onChange={(e) => { setU(e.target.value); setErr(''); }}
            placeholder="Adınız" className="input" autoFocus />
          <input type="password" value={p} onChange={(e) => { setP(e.target.value); setErr(''); }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Şifre" className="input" />
          {err && <p className="text-sm text-red-400">{err}</p>}
          <button onClick={submit} disabled={busy} className="btn-success w-full py-3">
            {busy ? '...' : 'Giriş Yap'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== OWNER PANEL ==========
function OwnerPanel({ onLogout, showToast }) {
  const [tab, setTab] = useState('customers');
  const [data, setData] = useState({ products: [], customers: [], txns: [], payments: [] });
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const r = await api('/api/data');
      setData({ products: r.products || [], customers: r.customers || [], txns: r.txns || [], payments: r.payments || [] });
    } catch (e) { showToast(e.message, 'error'); }
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

  const tabs = [
    { id: 'customers', label: 'Müşteriler', icon: Users },
    { id: 'products', label: 'Ürünler', icon: Package, badge: lowStock > 0 ? lowStock : null },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.07)', background: '#ffffff' }}>
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
            <Coffee className="w-5 h-5 text-gray-800" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-800">Çözüm Kantin</h1>
            <p className="text-xs text-gray-500">
              Açık borç: <span className="text-indigo-600 font-semibold">{fmtTL(totalDebt)}</span>
              {' · '}{data.customers.length} müşteri{' · '}{data.products.length} ürün
            </p>
          </div>
        </div>
      </header>

      <nav className="border-b" style={{ borderColor: 'rgba(0,0,0,0.07)', background: '#ffffff' }}>
        <div className="max-w-7xl mx-auto flex">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-semibold border-b-2 transition-all"
              style={{
                borderColor: tab === t.id ? '#6366f1' : 'transparent',
                color: tab === t.id ? '#818cf8' : '#6b7280',
                background: tab === t.id ? 'rgba(99,102,241,0.05)' : 'transparent',
              }}>
              <t.icon className="w-4 h-4" /> {t.label}
              {t.badge && (
                <span className="px-1.5 py-0.5 rounded-md text-xs font-bold"
                  style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-5 w-full flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {tab === 'customers' && <CustomersTab data={data} customerBalance={customerBalance} refresh={refresh} showToast={showToast} />}
            {tab === 'products' && <ProductsTab products={data.products} refresh={refresh} showToast={showToast} />}
          </>
        )}
      </main>

      <footer className="border-t py-4 flex justify-center" style={{ borderColor: 'rgba(0,0,0,0.07)', background: '#ffffff' }}>
        <button onClick={onLogout} className="btn-ghost flex items-center gap-2">
          <LogOut className="w-4 h-4" /> Çıkış Yap
        </button>
      </footer>
    </div>
  );
}

// ========== CUSTOMERS TAB ==========
function CustomersTab({ data, customerBalance, refresh, showToast }) {
  const { customers, txns, payments, products } = data;
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [saleCustomer, setSaleCustomer] = useState(null);
  const [paymentCustomer, setPaymentCustomer] = useState(null);
  const [form, setForm] = useState({ name: '', password: '' });
  const [busy, setBusy] = useState(false);

  const startAdd = () => {
    if (customers.length >= 20) { showToast('En fazla 20 müşteri eklenebilir', 'error'); return; }
    setForm({ name: '', password: '' }); setAdding(true);
  };

  const startEdit = (c) => { setForm({ name: c.name, password: c.password }); setEditing(c.id); };

  const submit = async () => {
    if (!form.name.trim() || !form.password.trim()) { showToast('Tüm alanları doldurun', 'error'); return; }
    const payload = { ...form, username: form.name };
    setBusy(true);
    try {
      if (editing) {
        await api('/api/customers', { method: 'PUT', body: JSON.stringify({ id: editing, ...payload }) });
        showToast('Müşteri güncellendi'); setEditing(null);
      } else {
        await api('/api/customers', { method: 'POST', body: JSON.stringify(payload) });
        showToast('Müşteri eklendi'); setAdding(false);
      }
      await refresh();
    } catch (e) { showToast(e.message, 'error'); }
    setBusy(false);
  };

  const remove = async (c) => {
    if (!confirm(`${c.name} silinsin mi?`)) return;
    try {
      await api(`/api/customers?id=${c.id}`, { method: 'DELETE' });
      showToast('Müşteri silindi'); await refresh();
    } catch (e) { showToast(e.message, 'error'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 mt-1">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Müşteriler</h2>
          <p className="text-xs text-gray-500">{customers.length} / 20</p>
        </div>
        <button onClick={startAdd} disabled={customers.length >= 20} className="btn-primary flex items-center gap-2 disabled:opacity-40">
          <Plus className="w-4 h-4" /> Yeni Müşteri
        </button>
      </div>

      {(adding || editing) && (
        <div className="card p-5 mb-4 animate-slide-in">
          <p className="text-sm font-bold text-gray-800 mb-3">{editing ? 'Müşteriyi Düzenle' : 'Yeni Müşteri'}</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Müşteri adı" className="input" />
            <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Şifre" className="input" />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={submit} disabled={busy} className="btn-success flex items-center gap-2 disabled:opacity-60">
              <Save className="w-4 h-4" /> Kaydet
            </button>
            <button onClick={() => { setAdding(false); setEditing(null); }} className="btn-ghost">İptal</button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[...customers].sort((a, b) => {
          const aPin = a.name.toLowerCase().startsWith('çözüm kurum');
          const bPin = b.name.toLowerCase().startsWith('çözüm kurum');
          if (aPin && !bPin) return -1;
          if (!aPin && bPin) return 1;
          return customerBalance(b.id) - customerBalance(a.id);
        }).map(c => {
          const bal = customerBalance(c.id);
          const cTxns = txns.filter(t => t.customerId === c.id);
          const cPays = payments.filter(p => p.customerId === c.id);
          return (
            <div key={c.id} className="card p-4 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{cTxns.length} alışveriş · {cPays.length} ödeme</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setViewing(c)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:bg-indigo-500/10 transition-all">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => startEdit(c)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(c)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-50 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="pt-3 border-t mb-3 flex justify-between items-center" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
                <span className="text-xs text-gray-500">Borç</span>
                <span className="text-2xl font-extrabold" style={{ color: bal > 0 ? '#ef4444' : '#22c55e' }}>{fmtTL(bal)}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSaleCustomer(c)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: 'white', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}>
                  <ShoppingBag className="w-3.5 h-3.5" /> Satış
                </button>
                <button onClick={() => setPaymentCustomer(c)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: 'white', boxShadow: '0 2px 8px rgba(34,197,94,0.3)' }}>
                  <Wallet className="w-3.5 h-3.5" /> Ödeme Al
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {customers.length === 0 && !adding && (
        <div className="card p-12 text-center mt-2">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="text-lg font-bold text-gray-800 mb-1">Henüz müşteri yok</h3>
          <p className="text-gray-500 text-sm">"Yeni Müşteri" ile başlayın</p>
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

      {saleCustomer && (
        <SaleModal
          customer={saleCustomer}
          products={products}
          customerBalance={customerBalance}
          onClose={() => setSaleCustomer(null)}
          onDone={() => { setSaleCustomer(null); refresh(); }}
          showToast={showToast}
        />
      )}

      {paymentCustomer && (
        <PaymentModal
          customer={paymentCustomer}
          customerBalance={customerBalance}
          onClose={() => setPaymentCustomer(null)}
          onDone={() => { setPaymentCustomer(null); refresh(); }}
          showToast={showToast}
        />
      )}
    </div>
  );
}

// ========== SALE MODAL ==========
function SaleModal({ customer, products, customerBalance, onClose, onDone, showToast }) {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q));
  }, [products, search]);

  const cartTotal = cart.reduce((s, item) => {
    const p = products.find(p => p.id === item.productId);
    return s + (p ? p.price * item.qty : 0);
  }, 0);

  const addToCart = (product) => {
    if (product.stock !== null && product.stock <= 0) { showToast('Stok yok!', 'error'); return; }
    const existing = cart.find(i => i.productId === product.id);
    if (existing) {
      if (product.stock !== null && existing.qty >= product.stock) { showToast('Stok yetersiz', 'error'); return; }
      setCart(cart.map(i => i.productId === product.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { productId: product.id, qty: 1, note: '' }]);
    }
  };

  const updateQty = (productId, delta) =>
    setCart(cart.map(i => i.productId === productId ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  const removeFromCart = (productId) => setCart(cart.filter(i => i.productId !== productId));
  const updateNote = (productId, note) => setCart(cart.map(i => i.productId === productId ? { ...i, note } : i));

  const completeSale = async () => {
    if (cart.length === 0) return;
    setBusy(true);
    try {
      await api('/api/transactions', {
        method: 'POST',
        body: JSON.stringify({ customerId: customer.id, items: cart.map(i => ({ productId: i.productId, qty: i.qty, note: i.note })) }),
      });
      showToast(`${fmtTL(cartTotal)} veresiyeye kaydedildi`);
      onDone();
    } catch (e) { showToast(e.message, 'error'); }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="card-elevated w-full sm:max-w-3xl max-h-[90vh] flex flex-col rounded-b-none sm:rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
          <div>
            <h3 className="font-bold text-gray-800">{customer.name} — Satış</h3>
            <p className="text-xs text-gray-500">Mevcut borç: <span className="text-red-500 font-semibold">{fmtTL(customerBalance(customer.id))}</span></p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Ürün ara..." className="input pl-9 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
              {filtered.map(p => {
                const outOfStock = p.stock !== null && p.stock <= 0;
                return (
                  <button key={p.id} onClick={() => !outOfStock && addToCart(p)} disabled={outOfStock}
                    className="text-left rounded-xl overflow-hidden transition-all hover:scale-[1.02] disabled:opacity-40"
                    style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)' }}>
                    <div className="aspect-square overflow-hidden" style={{ background: 'rgba(0,0,0,0.04)' }}>
                      {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="font-semibold text-xs text-gray-800 truncate">{p.name}</p>
                      <p className="text-indigo-600 font-bold text-xs">{fmtTL(p.price)}</p>
                      {p.stock !== null && (
                        <p className="text-xs" style={{ color: outOfStock ? '#ef4444' : p.stock <= 5 ? '#f97316' : '#9ca3af' }}>
                          {p.stock} adet
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {filtered.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">Ürün bulunamadı</p>}
          </div>

          <div className="sm:w-64 border-t sm:border-t-0 sm:border-l p-4 flex flex-col" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Sepet</p>
            {cart.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6 flex-1">Ürün seçin ←</p>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                  {cart.map(item => {
                    const p = products.find(p => p.id === item.productId);
                    if (!p) return null;
                    return (
                      <div key={item.productId} className="pb-3 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                        <div className="flex justify-between items-center mb-1.5">
                          <p className="font-semibold text-xs text-gray-800 flex-1 truncate">{p.name}</p>
                          <button onClick={() => removeFromCart(item.productId)} className="text-gray-300 hover:text-red-400 ml-1">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => updateQty(item.productId, -1)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-500"
                              style={{ background: 'rgba(0,0,0,0.07)' }}>
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="font-bold text-xs text-gray-800 w-4 text-center">{item.qty}</span>
                            <button onClick={() => updateQty(item.productId, 1)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-500"
                              style={{ background: 'rgba(0,0,0,0.07)' }}>
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                          <span className="text-xs font-bold text-indigo-600">{fmtTL(p.price * item.qty)}</span>
                        </div>
                        <input value={item.note} onChange={e => updateNote(item.productId, e.target.value)}
                          placeholder="Not..." className="input text-xs py-1" />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between items-center mb-3 pt-2 border-t" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
                  <span className="text-sm font-semibold text-gray-500">Toplam</span>
                  <span className="text-lg font-extrabold text-gray-800">{fmtTL(cartTotal)}</span>
                </div>
                <button onClick={completeSale} disabled={busy} className="btn-success w-full py-2.5">
                  {busy ? '...' : 'Veresiyeye Yaz'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== PAYMENT MODAL ==========
function PaymentModal({ customer, customerBalance, onClose, onDone, showToast }) {
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const bal = customerBalance(customer.id);

  const recordPayment = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    setBusy(true);
    try {
      await api('/api/payments', { method: 'POST', body: JSON.stringify({ customerId: customer.id, amount: amt }) });
      showToast(`${fmtTL(amt)} ödeme kaydedildi`);
      onDone();
    } catch (e) { showToast(e.message, 'error'); }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="card-elevated w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-gray-800">{customer.name}</h3>
            <p className="text-xs text-gray-500">Nakit Ödeme</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>

        <div className="rounded-xl p-4 mb-5 text-center" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <p className="text-xs text-gray-500 mb-1">Mevcut Borç</p>
          <p className="text-3xl font-extrabold" style={{ color: '#ef4444' }}>{fmtTL(bal)}</p>
        </div>

        <input type="number" step="0.01" value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Ödeme tutarı (₺)" className="input mb-3" autoFocus />
        <button onClick={() => setAmount(bal.toFixed(2))}
          className="btn-ghost w-full mb-3 text-sm">
          Tüm Borcu Kapat ({fmtTL(bal)})
        </button>
        <button onClick={recordPayment} disabled={busy || !amount} className="btn-success w-full py-3">
          {busy ? '...' : 'Ödemeyi Kaydet'}
        </button>
      </div>
    </div>
  );
}

// ========== CUSTOMER HISTORY MODAL ==========
function CustomerHistoryModal({ customer, txns, payments, onClose }) {
  const combined = useMemo(() => {
    const all = [...txns.map(t => ({ type: 'sale', ...t })), ...payments.map(p => ({ type: 'payment', ...p }))];
    return all.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [txns, payments]);

  const totalDebt = txns.reduce((s, t) => s + t.total, 0);
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const balance = totalDebt - totalPaid;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="card-elevated max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b flex justify-between items-start" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{customer.name}</h3>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-gray-500">Alışveriş: <span className="text-red-400 font-semibold">{fmtTL(totalDebt)}</span></span>
              <span className="text-gray-500">Ödeme: <span className="text-green-400 font-semibold">{fmtTL(totalPaid)}</span></span>
            </div>
            <p className="text-xl font-extrabold mt-1" style={{ color: balance > 0 ? '#f87171' : '#4ade80' }}>
              Bakiye: {fmtTL(balance)}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-y-auto p-5 space-y-3">
          {combined.length === 0 ? (
            <p className="text-center py-8 text-gray-400">Henüz kayıt yok</p>
          ) : combined.map(rec => (
            <div key={rec.id} className="rounded-xl p-3 border"
              style={{ borderColor: 'rgba(0,0,0,0.07)', background: rec.type === 'payment' ? 'rgba(34,197,94,0.06)' : 'rgba(0,0,0,0.03)' }}>
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  {rec.type === 'sale'
                    ? <ShoppingBag className="w-4 h-4 text-red-400" />
                    : <Wallet className="w-4 h-4 text-green-400" />}
                  <span className="text-xs text-gray-500">{fmtDate(rec.date)}</span>
                </div>
                <span className="font-bold text-sm" style={{ color: rec.type === 'sale' ? '#f87171' : '#4ade80' }}>
                  {rec.type === 'sale' ? '+' : '-'}{fmtTL(rec.type === 'sale' ? rec.total : rec.amount)}
                </span>
              </div>
              {rec.type === 'sale' && (
                <div className="ml-6 mt-2 space-y-1">
                  {rec.items.map((it, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm text-gray-300">
                        <span>{it.qty}× {it.productName}</span>
                        <span>{fmtTL(it.subtotal)}</span>
                      </div>
                      {it.note && <p className="text-xs text-gray-500 italic ml-2">📝 {it.note}</p>}
                    </div>
                  ))}
                </div>
              )}
              {rec.type === 'payment' && <p className="ml-6 text-xs text-green-500">Nakit ödeme alındı</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========== PRODUCTS TAB ==========
const CATEGORIES = [
  { id: 'sicak', label: 'Sıcak İçecekler', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  { id: 'soguk', label: 'Soğuk İçecekler', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
  { id: 'yiyecek', label: 'Yiyecekler', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  { id: 'diger', label: 'Diğer', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
];

function ProductsTab({ products, refresh, showToast }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', stock: '', image: '', trackStock: true, category: 'diger' });
  const [busy, setBusy] = useState(false);

  const startAdd = () => { setForm({ name: '', price: '', stock: '', image: '', trackStock: true, category: 'diger' }); setAdding(true); };
  const startEdit = (p) => {
    setForm({ name: p.name, price: p.price.toString(), stock: p.stock !== null ? p.stock.toString() : '', image: p.image || '', trackStock: p.stock !== null, category: p.category || 'diger' });
    setEditing(p.id);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500 * 1024) { showToast('Görsel 500KB altında olmalı', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (!form.name.trim() || !form.price) { showToast('İsim ve fiyat zorunlu', 'error'); return; }
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) { showToast('Geçerli bir fiyat girin', 'error'); return; }
    const stock = form.trackStock ? parseInt(form.stock) || 0 : null;
    setBusy(true);
    try {
      const payload = { name: form.name, price, stock, image: form.image, category: form.category };
      if (editing) {
        await api('/api/products', { method: 'PUT', body: JSON.stringify({ id: editing, ...payload }) });
        showToast('Ürün güncellendi'); setEditing(null);
      } else {
        await api('/api/products', { method: 'POST', body: JSON.stringify(payload) });
        showToast('Ürün eklendi'); setAdding(false);
      }
      await refresh();
    } catch (e) { showToast(e.message, 'error'); }
    setBusy(false);
  };

  const remove = async (p) => {
    if (!confirm(`${p.name} silinsin mi?`)) return;
    try { await api(`/api/products?id=${p.id}`, { method: 'DELETE' }); showToast('Ürün silindi'); await refresh(); }
    catch (e) { showToast(e.message, 'error'); }
  };

  const adjustStock = async (p, delta) => {
    try { await api('/api/products', { method: 'PATCH', body: JSON.stringify({ id: p.id, delta }) }); await refresh(); }
    catch (e) { showToast(e.message, 'error'); }
  };

  const grouped = useMemo(() => {
    return CATEGORIES.map(cat => ({
      ...cat,
      items: products.filter(p => (p.category || 'diger') === cat.id),
    })).filter(cat => cat.items.length > 0);
  }, [products]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4 mt-1">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Ürünler & Stok</h2>
          <p className="text-xs text-gray-500">{products.length} ürün</p>
        </div>
        <button onClick={startAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Yeni Ürün
        </button>
      </div>

      {(adding || editing) && (
        <div className="card p-5 mb-4 animate-slide-in">
          <p className="text-sm font-bold text-gray-800 mb-4">{editing ? 'Ürünü Düzenle' : 'Yeni Ürün'}</p>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Ürün adı</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Fiyat (₺)</label>
                <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Kategori</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat.id} type="button"
                      onClick={() => setForm({ ...form, category: cat.id })}
                      className="py-2 px-3 rounded-xl text-xs font-semibold text-left transition-all border"
                      style={{
                        background: form.category === cat.id ? cat.bg : 'transparent',
                        borderColor: form.category === cat.id ? cat.color : 'rgba(0,0,0,0.1)',
                        color: form.category === cat.id ? cat.color : '#6b7280',
                      }}>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.trackStock} onChange={(e) => setForm({ ...form, trackStock: e.target.checked })}
                  className="w-4 h-4 accent-indigo-500" />
                <span className="text-sm text-gray-500">Stok takibi yap</span>
              </label>
              {form.trackStock && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Stok adedi</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input" />
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Ürün görseli</label>
              <div className="aspect-square rounded-xl border-2 border-dashed flex items-center justify-center mb-3 overflow-hidden"
                style={{ borderColor: 'rgba(0,0,0,0.08)', background: 'rgba(0,0,0,0.03)' }}>
                {form.image ? <img src={form.image} alt="" className="w-full h-full object-cover" /> : <Package className="w-12 h-12 text-gray-300" />}
              </div>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-gray-500 w-full" />
              {form.image && <button onClick={() => setForm({ ...form, image: '' })} className="text-xs text-red-400 mt-1">Görseli kaldır</button>}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={submit} disabled={busy} className="btn-success flex items-center gap-2 disabled:opacity-60">
              <Save className="w-4 h-4" /> Kaydet
            </button>
            <button onClick={() => { setAdding(false); setEditing(null); }} className="btn-ghost">İptal</button>
          </div>
        </div>
      )}

      {products.length === 0 && !adding ? (
        <div className="card p-12 text-center mt-2">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="text-lg font-bold text-gray-800 mb-1">Henüz ürün yok</h3>
          <p className="text-gray-500 text-sm">"Yeni Ürün" ile başlayın</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(cat => (
            <div key={cat.id}>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-lg text-xs font-bold"
                  style={{ background: cat.bg, color: cat.color }}>
                  {cat.label}
                </span>
                <span className="text-xs text-gray-400">{cat.items.length} ürün</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {cat.items.map(p => {
                  const lowStock = p.stock !== null && p.stock <= 5;
                  const outOfStock = p.stock !== null && p.stock <= 0;
                  return (
                    <div key={p.id} className="card overflow-hidden flex flex-col">
                      <div className="relative" style={{ paddingBottom: '100%' }}>
                        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.04)' }}>
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-10 h-10 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1">
                          <button onClick={() => startEdit(p)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                            style={{ background: 'rgba(255,255,255,0.9)', color: '#6b7280' }}>
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => remove(p)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                            style={{ background: 'rgba(255,255,255,0.9)', color: '#6b7280' }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {outOfStock && (
                          <div className="absolute inset-0 flex items-center justify-center"
                            style={{ background: 'rgba(0,0,0,0.45)' }}>
                            <span className="text-white text-xs font-bold px-2 py-1 rounded-lg"
                              style={{ background: 'rgba(239,68,68,0.9)' }}>Tükendi</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3 flex flex-col flex-1">
                        <p className="font-bold text-gray-800 text-sm truncate">{p.name}</p>
                        <p className="text-indigo-600 font-bold text-sm mb-2">{fmtTL(p.price)}</p>
                        {p.stock !== null ? (
                          <div className="flex items-center justify-between mt-auto pt-2 border-t" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
                            <button onClick={() => adjustStock(p, -1)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{ background: 'rgba(0,0,0,0.07)', color: '#6b7280' }}>
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-bold flex items-center gap-1"
                              style={{ color: outOfStock ? '#f87171' : lowStock ? '#fb923c' : '#9ca3af' }}>
                              {(lowStock || outOfStock) && <AlertTriangle className="w-3 h-3" />}
                              {p.stock} adet
                            </span>
                            <button onClick={() => adjustStock(p, 1)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{ background: 'rgba(0,0,0,0.07)', color: '#6b7280' }}>
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 mt-auto pt-2 border-t" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>Stok takibi yok</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
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
      try { const r = await api('/api/data'); setData(r); } catch {}
      setLoading(false);
    })();
  }, []);

  const combined = useMemo(() => {
    if (!data) return [];
    return [
      ...data.txns.map(t => ({ type: 'sale', ...t })),
      ...data.payments.map(p => ({ type: 'payment', ...p })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [data]);

  const monthlyHistory = useMemo(() => {
    if (!data) return [];
    const now = new Date();
    const all = [
      ...data.txns.map(t => ({ d: t.date, v: t.total })),
      ...data.payments.map(p => ({ d: p.date, v: -p.amount })),
    ].sort((a, b) => new Date(a.d) - new Date(b.d));
    return Array.from({ length: 6 }, (_, i) => {
      const idx = 5 - i;
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - idx + 1, 0, 23, 59, 59);
      const cumulative = all.filter(x => new Date(x.d) <= monthEnd).reduce((s, x) => s + x.v, 0);
      return {
        name: new Date(now.getFullYear(), now.getMonth() - idx, 1).toLocaleDateString('tr-TR', { month: 'short' }),
        bakiye: Math.max(0, Math.round(cumulative * 100) / 100),
      };
    });
  }, [data]);

  if (loading || !data) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalDebt = data.txns.reduce((s, t) => s + t.total, 0);
  const totalPaid = data.payments.reduce((s, p) => s + p.amount, 0);
  const balance = totalDebt - totalPaid;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.07)', background: '#ffffff' }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>
              <User className="w-5 h-5 text-gray-800" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-800">Hoş geldiniz, {customer.name}</h1>
            </div>
          </div>
          <button onClick={onLogout} className="btn-ghost flex items-center gap-2 text-sm py-2">
            <LogOut className="w-4 h-4" /> Çıkış
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-5 w-full space-y-4 flex-1">
        <div className="card-elevated p-7 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{
            background: balance > 0
              ? 'radial-gradient(circle at 50% 0%, #ef4444, transparent 70%)'
              : 'radial-gradient(circle at 50% 0%, #22c55e, transparent 70%)',
          }} />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Mevcut Borç</p>
          <p className="text-6xl font-extrabold mb-4 tracking-tight" style={{ color: balance > 0 ? '#f87171' : '#4ade80' }}>
            {fmtTL(balance)}
          </p>
          <div className="flex justify-center gap-8 text-sm">
            <div>
              <p className="text-gray-500 text-xs mb-1">Toplam Alışveriş</p>
              <p className="font-bold text-red-400">{fmtTL(totalDebt)}</p>
            </div>
            <div className="w-px" style={{ background: 'rgba(0,0,0,0.07)' }} />
            <div>
              <p className="text-gray-500 text-xs mb-1">Toplam Ödeme</p>
              <p className="font-bold text-green-400">{fmtTL(totalPaid)}</p>
            </div>
          </div>
        </div>

        {combined.length > 0 && (
          <div className="card p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Son 6 Ay — Bakiye Seyri</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={monthlyHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, color: '#1a1d2e' }}
                  formatter={(v) => fmtTL(v)} />
                <Line type="monotone" dataKey="bakiye" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">İşlem Geçmişi</p>
          {combined.length === 0 ? (
            <p className="text-center py-8 text-gray-400 text-sm">Henüz işlem yok</p>
          ) : (
            <div className="space-y-3">
              {combined.map(rec => (
                <div key={rec.id} className="rounded-xl p-3.5 border"
                  style={{ borderColor: 'rgba(0,0,0,0.07)', background: rec.type === 'payment' ? 'rgba(34,197,94,0.05)' : 'rgba(0,0,0,0.03)' }}>
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      {rec.type === 'sale' ? <ShoppingBag className="w-4 h-4 text-red-400" /> : <Wallet className="w-4 h-4 text-green-400" />}
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{rec.type === 'sale' ? 'Alışveriş' : 'Nakit Ödeme'}</p>
                        <p className="text-xs text-gray-500">{fmtDate(rec.date)}</p>
                      </div>
                    </div>
                    <span className="text-base font-bold" style={{ color: rec.type === 'sale' ? '#f87171' : '#4ade80' }}>
                      {rec.type === 'sale' ? '+' : '-'}{fmtTL(rec.type === 'sale' ? rec.total : rec.amount)}
                    </span>
                  </div>
                  {rec.type === 'sale' && (
                    <div className="ml-6 mt-2 pt-2 border-t space-y-1" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
                      {rec.items.map((it, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-sm text-gray-300">
                            <span><strong>{it.qty}×</strong> {it.productName}</span>
                            <span>{fmtTL(it.subtotal)}</span>
                          </div>
                          {it.note && <p className="text-xs text-gray-500 italic ml-2">📝 {it.note}</p>}
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
