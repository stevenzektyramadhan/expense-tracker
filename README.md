# 📖 Personal Expense Tracker

Aplikasi web untuk **mencatat pengeluaran pribadi** menggunakan **Next.js, Supabase, dan Cloudinary**.

MVP ini ditujukan untuk penggunaan pribadi & lingkar terdekat, dengan fitur:

- ✅ Login/registrasi
- ✅ Tambah & lihat pengeluaran
- ✅ Ringkasan bulanan
- ✅ (Opsional) Upload bukti struk ke Cloudinary

---

## 🚀 Tech Stack

- **Next.js (App Router)** → Frontend & API routes
- **TailwindCSS** → Styling UI
- **Supabase** → Authentication + Postgres Database + Row Level Security (RLS)
- **Cloudinary** → Media storage untuk foto struk
- **Vercel** → (opsional) Deployment

---

## 📂 Folder Structure

```
expense-tracker/
├─ app/                       # Next.js App Router
│  ├─ (auth)/                 # Auth pages (doesn't affect URL)
│  │  ├─ login/page.js
│  │  ├─ register/page.js
│  │
│  ├─ (dashboard)/            # Dashboard pages
│  │  ├─ layout.js            # Layout with navbar/sidebar
│  │  ├─ page.js              # List pengeluaran
│  │  ├─ add/page.js          # Form tambah pengeluaran
│  │  ├─ summary/page.js      # Ringkasan bulanan
│  │
│  ├─ api/                    # API Routes
│  │  ├─ upload/route.js      # Upload struk ke Cloudinary
│  │
│  ├─ layout.js               # Root layout
│  └─ page.js                 # Landing page / redirect
│
├─ components/                # Reusable components
│  ├─ ui/                     # Basic UI (Button, Card, Input)
│  ├─ forms/                  # Form-specific components
│
├─ hooks/                     # Custom hooks (useAuth, useExpenses)
├─ lib/                       # Helpers
│  ├─ supabaseClient.js       # Supabase init
│  ├─ cloudinary.js           # Cloudinary init
│
├─ styles/                    # Tailwind styles
│  ├─ globals.css
├─ public/                    # Static assets
├─ .env.local                 # Env variables
├─ tailwind.config.js
├─ jsconfig.json              # Path alias (@)
└─ README.md
```

---

## 🔧 Setup & Installation

1. **Clone repo & install dependencies**

```bash
git clone <repo-url>
cd expense-tracker
npm install
```

2. **Setup Supabase**

   - Buat project di [Supabase](https://supabase.com)
   - Aktifkan Email Auth
   - Buat tabel `expenses`

   ```sql
   CREATE TABLE expenses (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     amount DECIMAL(10,2) NOT NULL,
     category VARCHAR(50) NOT NULL,
     date DATE NOT NULL,
     description TEXT,
     receipt_url TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );

   ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Users can view own expenses"
   ON expenses FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own expenses"
   ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
   ```

3. **Setup Cloudinary** (opsional, untuk upload struk)

   - Buat akun [Cloudinary](https://cloudinary.com)
   - Ambil `CLOUD_NAME`, `API_KEY`, `API_SECRET`

4. \*\*Buat file \*\*\`\`

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>

CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
```

5. **Jalankan dev server**

```bash
npm run dev
```

6. **Build & Production**

```bash
npm run build
npm start
```

---

## 🗄 Database Schema

Tabel utama: **expenses**

| Field       | Type          | Description                  |
| ----------- | ------------- | ---------------------------- |
| id          | UUID (PK)     | Auto-generated ID            |
| user_id     | UUID          | Reference ke `auth.users.id` |
| amount      | DECIMAL(10,2) | Jumlah pengeluaran           |
| category    | VARCHAR(50)   | Makanan, Transportasi, dll   |
| date        | DATE          | Tanggal pengeluaran          |
| description | TEXT          | Deskripsi optional           |
| receipt_url | TEXT          | URL bukti struk (Cloudinary) |
| created_at  | TIMESTAMP     | Waktu insert                 |

---

## ✨ Fitur

- ✅ **Autentikasi Supabase** (email/password)
- ✅ **Tambah pengeluaran** (amount, kategori, tanggal, deskripsi, upload struk opsional)
- ✅ **List pengeluaran** user (hanya bisa lihat data sendiri)
- ✅ **Ringkasan bulanan** (total + per kategori)
- ✅ **Row Level Security** di Supabase → aman untuk multi-user

---

## 🔐 Security Hardening (Phase 1)

Mulai fase ini, endpoint API internal menggunakan model **session-only**:

- Endpoint tidak lagi mempercayai `user_id` dari body/query.
- User diambil dari session cookie Supabase di server.
- Jika session tidak valid, API mengembalikan `401 Unauthorized`.

### Endpoint yang di-hardening

- `POST /api/expenses`
- `GET /api/expenses`
- `GET /api/summary`
- `POST /api/allowances`
- `GET /api/allowances`
- `POST /api/upload`
- `DELETE /api/upload`

### Validasi upload

- Hanya menerima file bertipe image (`image/*`)
- Maksimal ukuran file: **5MB**

### Dampak ke frontend

- Frontend tidak perlu (dan tidak boleh mengandalkan) `user_id` untuk endpoint di atas.
- Contoh: request ringkasan menjadi `GET /api/summary` tanpa query `user_id`.

## ⚖️ Data Consistency (Phase 2)

Fase ini memastikan `allowances.remaining` tetap sinkron saat pengeluaran diubah atau dihapus.

- `PUT /api/expenses` sekarang mengubah expense **dan** menyesuaikan `allowances.remaining` dalam satu transaksi database.
- `DELETE /api/expenses` sekarang menghapus expense **dan** mengembalikan nominal ke `allowances.remaining` dalam satu transaksi database.
- Operasi update/delete expense dari UI dashboard sudah dipindahkan ke API ini (tidak lagi update/delete langsung dari client ke tabel `expenses`).

### Aturan saldo

- Update nominal expense yang membuat saldo jadi negatif akan ditolak (`400`).
- Saat pengembalian saldo (mis. delete), nilai `remaining` di-clamp agar tidak melebihi nilai `amount` allowance.
