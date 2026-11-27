# DOMESTIC — Anggaran Rumah Tangga

[![Bounty](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![Rank](https://make.fun/badge/best-household-budget-site-20261126-1457/agungtriyonode/budget-site/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![Reward](https://make.fun/badge/best-household-budget-site-20261126-1457/agungtriyonode/budget-site/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

**Setiap Rupiah Punya Tugas. Bahkan yang Buat Lebaran.**

Anggaran rumah tangga zero-based untuk keluarga Indonesia — situs statis yang
berjalan offline di browser, desktop maupun HP. Dibangun untuk
[Make the best household budget site](https://make.fun/bounty/best-household-budget-site-20261126-1457)
di make.fun.

## Yang bisa dilakukan situs ini

1. **Anggaran zero-based + waterfall aliran dana** — pemasukan Rp 14.700.000/bulan
   (contoh: Keluarga Prasetyo, 4 anggota) dibagi habis ke 10 kategori; diagram
   aliran menunjukkan tiap rupiah mengalir ke tugasnya, sisa akhir bulan Rp 0.
2. **Sinking Fund di layar pertama** — enam biaya tahunan (liburan, pajak kendaraan,
   asuransi, perawatan rumah, gadget, Lebaran) dibagi 12 dan disisihkan tiap bulan,
   lengkap dengan progres terkumpul vs target tahunan.
3. **Simulator What-If** — slider biaya (makanan, transportasi, hiburan) + skenario
   pemasukan (normal / −20% / bonus +10%) mengubah langsung sisa akhir bulan,
   runway dana darurat, dan proyeksi saldo 12 bulan.
4. **Mode rumah tangga 2–4 anggota** — tiga contoh rumah tangga (Raka & Lestari,
   Keluarga Mahesa, Keluarga Prasetyo); ganti contoh dan seluruh halaman ikut berubah.
5. **Demo terisi penuh + prerender statis** — semua angka nyata tertulis di HTML awal,
   bukan placeholder; cetak ringkasan dan ekspor JSON tersedia.

## Menjalankan

```sh
node serve.ts        # http://localhost:8080
```

Lalu buka di Chrome desktop dan ukuran HP. Semua file di bawah `app/` — tanpa
build step, tanpa CDN, tanpa font eksternal, tanpa network request apa pun.

## Menyerahkan (program)

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` memvalidasi dulu bahwa angka prerender di `app/index.html` sama persis
dengan yang dihitung `src/core.js` dari `src/data.js`, lalu menyalin `app/` dan
`screenshots/` ke `/output` dan menulis `/output/dossier.json` dengan
`vendor/makefun-frontend.ts`.

## Struktur

- `app/index.html` — halaman (prerender: Keluarga Prasetyo, 4 anggota)
- `app/style.css` — semua gaya, font sistem saja
- `app/data.js` — tiga contoh rumah tangga (salinan browser dari `src/data.js`)
- `app/core.js` — matematika anggaran murni (salinan browser dari `src/core.js`)
- `app/main.js` — waterfall, simulator, ganti rumah tangga, cetak/ekspor
- `src/core.js`, `src/data.js` — sumber kanonik yang dipakai `main.ts` untuk validasi
- `main.ts` — program penyerahan; `serve.ts` — server lokal; `check.mjs` — verifikasi
- `screenshots/` — 4 tangkapan layar asli dari render browser

## Lisensi

MIT — lihat `LICENSE`.
