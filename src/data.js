// DOMESTIC — demo households. Realistic Indonesian figures for November 2026,
// written as constants: no network, no clock, no randomness. Every household
// is a zero-based budget: its categories add up to exactly its income.

export const HOUSEHOLDS = {
  2: {
    members: 2,
    name: "Raka & Lestari",
    tagline: "Pasangan muda, baru menikah, tinggal di kontrakan",
    income: [
      { label: "Gaji Raka", amount: 7500000 },
      { label: "Gaji Lestari", amount: 3500000 },
    ],
    categories: [
      { id: "rumah", label: "Tempat tinggal", note: "Kontrakan 2 kamar", amount: 2000000 },
      { id: "makan", label: "Makanan & dapur", note: "Belanja mingguan + makan di luar", amount: 2200000 },
      { id: "transport", label: "Transportasi", note: "Bensin motor + ojek online", amount: 1100000 },
      { id: "tagihan", label: "Listrik, air, internet", note: "Token + PDAM + wifi", amount: 750000 },
      { id: "kursus", label: "Pengembangan diri", note: "Kursus online + buku", amount: 1000000 },
      { id: "kesehatan", label: "Kesehatan", note: "BPJS + obat-obatan", amount: 500000 },
      { id: "hiburan", label: "Hiburan & gaya hidup", note: "Nonton, kopi, nongkrong", amount: 700000 },
      { id: "pakaian", label: "Pakaian", note: "Baju + sepatu", amount: 300000 },
      { id: "darurat", label: "Dana darurat", note: "Tabungan wajib tiap bulan", amount: 1200000 },
      { id: "sinking", label: "Sinking fund", note: "Biaya tahunan dibagi 12", amount: 1250000 },
    ],
    sinking: [
      { id: "liburan", label: "Liburan", annual: 4800000, saved: 1600000 },
      { id: "pajak", label: "Pajak kendaraan", annual: 1800000, saved: 900000 },
      { id: "asuransi", label: "Asuransi tahunan", annual: 3000000, saved: 1500000 },
      { id: "perawatan", label: "Perawatan rumah", annual: 1800000, saved: 450000 },
      { id: "gadget", label: "Gadget & elektronik", annual: 1800000, saved: 600000 },
      { id: "lebaran", label: "Lebaran & hari raya", annual: 1800000, saved: 900000 },
    ],
    emergency: { balance: 24000000, note: "Setara 2,4 bulan pengeluaran wajib" },
  },

  3: {
    members: 3,
    name: "Keluarga Mahesa",
    tagline: "Ayah, ibu, dan satu anak (Kirana, 6 tahun)",
    income: [
      { label: "Gaji Andi", amount: 8000000 },
      { label: "Gaji Maya", amount: 4000000 },
      { label: "Usaha sampingan", amount: 1000000 },
    ],
    categories: [
      { id: "rumah", label: "Tempat tinggal", note: "Cicilan KPR", amount: 2300000 },
      { id: "makan", label: "Makanan & dapur", note: "Belanja mingguan + bekal Kirana", amount: 2800000 },
      { id: "transport", label: "Transportasi", note: "Bensin + servis + antar anak", amount: 1300000 },
      { id: "tagihan", label: "Listrik, air, internet", note: "Token + PDAM + wifi", amount: 900000 },
      { id: "pendidikan", label: "Pendidikan anak", note: "SPP TK + les", amount: 900000 },
      { id: "kesehatan", label: "Kesehatan", note: "BPJS + vitamin anak", amount: 550000 },
      { id: "hiburan", label: "Hiburan & gaya hidup", note: "Jalan-jalan akhir pekan", amount: 750000 },
      { id: "pakaian", label: "Pakaian", note: "Baju anak cepat kecil", amount: 300000 },
      { id: "darurat", label: "Dana darurat", note: "Tabungan wajib tiap bulan", amount: 1400000 },
      { id: "sinking", label: "Sinking fund", note: "Biaya tahunan dibagi 12", amount: 1800000 },
    ],
    sinking: [
      { id: "liburan", label: "Liburan keluarga", annual: 6000000, saved: 3000000 },
      { id: "pajak", label: "Pajak kendaraan", annual: 2400000, saved: 1200000 },
      { id: "asuransi", label: "Asuransi tahunan", annual: 3600000, saved: 900000 },
      { id: "perawatan", label: "Perawatan rumah", annual: 2400000, saved: 600000 },
      { id: "gadget", label: "Gadget & elektronik", annual: 2400000, saved: 1200000 },
      { id: "lebaran", label: "Lebaran & hari raya", annual: 4800000, saved: 2400000 },
    ],
    emergency: { balance: 32000000, note: "Setara 2,7 bulan pengeluaran wajib" },
  },

  4: {
    members: 4,
    name: "Keluarga Prasetyo",
    tagline: "Ayah, ibu, dan dua anak (Dimas, 12 tahun; Nadia, 8 tahun)",
    income: [
      { label: "Gaji Budi", amount: 8500000 },
      { label: "Gaji Sari", amount: 5000000 },
      { label: "Usaha sampingan", amount: 1200000 },
    ],
    categories: [
      { id: "rumah", label: "Tempat tinggal", note: "Cicilan KPR", amount: 2500000 },
      { id: "makan", label: "Makanan & dapur", note: "Belanja mingguan + bekal anak", amount: 3200000 },
      { id: "transport", label: "Transportasi", note: "Bensin 2 motor + servis", amount: 1400000 },
      { id: "tagihan", label: "Listrik, air, internet", note: "Token + PDAM + wifi", amount: 950000 },
      { id: "pendidikan", label: "Pendidikan anak", note: "SPP 2 anak + les", amount: 1800000 },
      { id: "kesehatan", label: "Kesehatan", note: "BPJS + obat-obatan", amount: 600000 },
      { id: "hiburan", label: "Hiburan & gaya hidup", note: "Jalan-jalan + langganan", amount: 800000 },
      { id: "pakaian", label: "Pakaian", note: "Seragam + baju harian", amount: 350000 },
      { id: "darurat", label: "Dana darurat", note: "Tabungan wajib tiap bulan", amount: 1500000 },
      { id: "sinking", label: "Sinking fund", note: "Biaya tahunan dibagi 12", amount: 1600000 },
    ],
    sinking: [
      { id: "liburan", label: "Liburan keluarga", annual: 6000000, saved: 2500000 },
      { id: "pajak", label: "Pajak kendaraan", annual: 2400000, saved: 1200000 },
      { id: "asuransi", label: "Asuransi tahunan", annual: 3600000, saved: 1800000 },
      { id: "perawatan", label: "Perawatan rumah", annual: 2400000, saved: 800000 },
      { id: "gadget", label: "Gadget & elektronik", annual: 2400000, saved: 1000000 },
      { id: "lebaran", label: "Lebaran & hari raya", annual: 2400000, saved: 1200000 },
    ],
    emergency: { balance: 40000000, note: "Setara 3,0 bulan pengeluaran wajib" },
  },
};

export const MONTH_LABEL = "November 2026";
export const SITE_NAME = "DOMESTIC";
export const SITE_TAGLINE = "Every Dollar Has a Job. Even the Expenses You Forgot.";
