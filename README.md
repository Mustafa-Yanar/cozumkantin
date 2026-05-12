# Çözüm Kantin · Veresiye Defteri

Mahalle kantini için modern veresiye takip sistemi. Kantinci ürünleri, müşterileri ve borçları yönetir; müşteriler de kendi panellerinden borç durumlarını anlık takip eder.

Yapı: **Next.js 14 + Vercel KV + JWT cookie auth**

---

## 🚀 Adım Adım Vercel'e Deploy

### 1) Projeyi GitHub'a yükle

GitHub'da yeni boş bir repo oluştur (örn: `cozumkantin`). Sonra bu klasörde terminalde:

```bash
git init
git add .
git commit -m "ilk surum"
git branch -M main
git remote add origin https://github.com/KULLANICIADIN/cozumkantin.git
git push -u origin main
```

### 2) Vercel'de proje oluştur

1. https://vercel.com → Giriş yap (GitHub ile)
2. **Add New → Project**
3. GitHub repo'nu seç (`cozumkantin`) → **Import**
4. Proje adı: **`cozumkantin`** yaz (bu, alt domain'i `cozumkantin.vercel.app` yapar)
5. Framework: Next.js (otomatik tanır)
6. **Deploy** butonuna tıklama — önce KV ve env değişkenleri ekleyeceğiz! Şimdilik deploy etmeden bırak (veya deploy et, env'leri sonra eklersin, sonra yeniden deploy).

### 3) Vercel KV (veritabanı) bağla

1. Proje sayfasında → **Storage** sekmesi
2. **Create Database** → **KV** seç → **Continue**
3. İsim: `cozumkantin-kv` → Region: **Frankfurt** (Türkiye'ye en yakın) → **Create**
4. KV oluşunca → **Connect Project** → projeni seç → **Connect**
5. Tamam! Vercel otomatik olarak KV_URL, KV_REST_API_URL vb. environment variable'ları ekledi.

### 4) JWT Secret ekle

1. Proje → **Settings** → **Environment Variables**
2. Yeni değişken ekle:
   - **Key:** `JWT_SECRET`
   - **Value:** Rastgele 32+ karakterli bir string. Örnek üretme: terminalde `openssl rand -base64 48` (veya https://generate-secret.now.sh/32 git, üretilen değeri kopyala)
   - Environments: Production, Preview, Development → hepsi işaretli
3. **Save**

### 5) Yeniden deploy et

1. **Deployments** sekmesi
2. En üstteki deploy'un sağındaki **⋯** menüsünden **Redeploy**
3. ~1 dakika sonra: **`https://cozumkantin.vercel.app`** hazır!

### 6) İlk kullanım

1. `https://cozumkantin.vercel.app` aç
2. "Kantinci Girişi" → ilk şifreni belirle (en az 4 karakter)
3. Önce "Ürünler / Stok"tan ürünleri ekle
4. Sonra "Müşteriler"den müşteri hesaplarını aç (her birine kullanıcı adı + şifre ver)
5. Müşterilere "kullanıcı adınız: `xxx`, şifreniz: `yyy`, link: cozumkantin.vercel.app" diye haber ver.

---

## 🛠️ Yerel geliştirme (opsiyonel)

```bash
cp .env.local.example .env.local
# .env.local içine kendi KV bilgilerini ve JWT_SECRET'i yaz
npm install
npm run dev
```

http://localhost:3000

Yerel için KV: Vercel dashboard → KV → `.env.local` tab'ından kopyala.

---

## 📦 Özellikler

- **Kantinci paneli (şifre ile):** Müşteri (max 20) ve ürün yönetimi, satış yapma, ödeme alma, raporlar
- **Müşteri paneli:** Anlık borç, son 6 ay grafik, tüm işlem geçmişi
- **Sepet + not:** Her ürüne özel not ekleme (örn: "az şekerli")
- **Stok takibi:** Otomatik azalma, düşük stok uyarısı, satış engelleme
- **Rapor:** CSV (Excel) ve PDF (yazdırılabilir) çıktı, aylık alışveriş/ödeme grafiği, en çok satan ürünler
- **Güvenli:** Bcrypt parola hashleme + JWT httpOnly cookie session

---

## ⚙️ Teknik detaylar

- **Framework:** Next.js 14 App Router
- **DB:** Vercel KV (Redis tabanlı, ücretsiz tier: 30,000 komut/ay - bir kantin için fazlasıyla yeterli)
- **Auth:** JWT (jose) httpOnly cookie, owner şifresi bcrypt ile hashlenir
- **Stil:** Tailwind + inline style (kraft kağıdı estetiği)

### Veri yapısı (KV anahtarları)
- `owner_pwd_hash` — Kantinci şifresinin bcrypt hash'i
- `products_list` — Ürün listesi (görsel base64 dahil)
- `customers_list` — Müşteri listesi (kullanıcı adı + plain text şifre)
- `transactions_log` — Satış kayıtları
- `payments_log` — Nakit ödeme kayıtları

### Güvenlik notu
Müşteri şifreleri şu an plain text saklanıyor — kantincinin müşteriye şifreyi söyleyebilmesi için. Yüksek güvenlik istersen `customers/route.js`'deki şifre kısmını bcrypt ile hashleyebilirsin (sonra şifreyi gösteremezsin, sadece sıfırlayabilirsin).

---

## 🔄 Yedekleme

KV verilerini yedeklemek için: Vercel dashboard → KV → Data Browser'dan tüm anahtarları görüp kopyalayabilirsin. Veya ileride bir `/api/backup` endpoint'i eklenebilir.

---

## ❓ Sorun giderme

- **"500 Internal Server Error":** Çoğunlukla `JWT_SECRET` eksik. Settings → Environment Variables kontrol et, sonra redeploy.
- **"Müşteri kayıtları kayboldu":** KV bağlı değil. Storage sekmesinden KV'nin projeye bağlı olduğunu doğrula, sonra redeploy.
- **"Build hatası":** `npm install` yerel olarak çalışıyor mu kontrol et. Node 18+ gerekli.

---

## 📄 Lisans

Kişisel kullanım için serbest. Ticari dağıtım için yazara danışın.
