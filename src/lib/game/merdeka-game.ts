/**
 * Angka-angka game Kemerdekaan "The 17-Box Climb".
 *
 * Kembaran berkas ini ada di backend (`src/common/constants/merdeka-game.ts`).
 * Kalau salah satu diubah, ubah keduanya - backend yang berhak menolak ronde,
 * jadi angka di sini cuma dipakai untuk menampilkan aturan dan menyetel animasi.
 *
 * Nilai permainannya (lebar dus, toleransi, laju, tinggi gantungan) disalin
 * dari demo artifact yang jadi acuan, bukan dikarang ulang - demo itu yang
 * sudah disetujui, jadi angkanya ikut apa adanya.
 */

export const TARGET_DUS = 17;
export const BATAS_WAKTU_DETIK = 45;

/** Jendela campaign, sama dengan MERDEKA_GAME di backend. */
export const GAME_MULAI = "2026-08-17T00:00:00+07:00";
export const GAME_SELESAI = "2026-09-01T00:00:00+07:00";

// -- Ukuran papan ------------------------------------------------------------

/** Ukuran logis kanvas. Tampilannya diskalakan CSS, jadi ini bukan piksel layar. */
export const PAPAN_W = 420;
export const PAPAN_H = 620;

/** Tinggi satu dus dan lebar dus pertama. */
export const TINGGI_DUS = 32;
export const LEBAR_AWAL = 150;

/** Selisih maksimum yang masih dihitung "pas", dan bonus lebarnya. */
export const TOLERANSI_PAS = 6;
export const BONUS_PAS = 6;

/** Tinggi dus digantung crane di atas puncak menara sebelum dijatuhkan. */
export const TINGGI_GANTUNGAN = 108;

/** Laju geser dus: pelan di bawah, makin ngebut tiap tingkat, ada batasnya. */
export function lajuDus(tingkat: number): number {
  return 2.5 + Math.min(tingkat * 0.1, 1.7);
}

/**
 * Kamera saat menara sudah penuh.
 *
 * Kamera mengejar `puncak.y + TINGGI_DUS - PAPAN_H * 0.4`, jadi nilai
 * tertingginya jatuh saat dus ke-17 mendarat. Dipakai dua kali: menahan geser
 * kamera, dan memetakan perjalanan latar.
 */
export const KAMERA_MAKS =
  TARGET_DUS * TINGGI_DUS + TINGGI_DUS - PAPAN_H * 0.4;

// -- Latar -------------------------------------------------------------------

/**
 * Turunan siap-web dari aset asli `public/images/BGjpg` (1260 x 7750).
 *
 * Aslinya jauh lebih tinggi dari jarak yang benar-benar ditempuh kamera satu
 * ronde, jadi latarnya melesat berkali-kali lipat lebih cepat dari menaranya.
 * Tingginya dipotong supaya persis sepanjang pendakian: satu ronde penuh =
 * satu gambar penuh, dan garis rumputnya menempel di dasar menara.
 *
 * Potongannya bukan potong-buang: adegan panjat pinang + rumput + tanah di
 * bawah dan langit malam berbintang di atas dipertahankan 1:1, yang dimampatkan
 * cuma pita gradasi langit kosong di antaranya - dengan laju mampat berbentuk
 * sin^2 supaya tidak ada garis horizon palsu di sambungannya. Aset aslinya
 * tetap disimpan di repo sebagai sumber.
 */
export const BG_SRC = "/images/merdeka-bg.jpg";
export const BG_W_ASLI = 1260;
export const BG_H_ASLI = 2844;

/**
 * Posisi garis rumput di dalam gambar hasil potong, diukur dari pemetaan baris
 * saat gambar itu dibuat. Dus paling bawah berdiri persis di garis ini.
 */
export const BG_RASIO_TANAH = 0.8959;

/** Tinggi gambar latar setelah dilebarkan menyamai lebar kanvas. */
export const BG_H_TAMPIL = (PAPAN_W * BG_H_ASLI) / BG_W_ASLI;

/**
 * Garis tanah di layar saat kamera masih di dasar.
 *
 * Diturunkan dari gambarnya, bukan angka karangan: saat kamera 0 latar digambar
 * rata bawah, jadi tanah jatuh di tinggi papan dikurangi sisa gambar yang ada
 * di bawah garis rumput.
 */
export const GARIS_TANAH = PAPAN_H - BG_H_TAMPIL * (1 - BG_RASIO_TANAH);

// -- Roda hadiah -------------------------------------------------------------

/**
 * Turunan 1500 px dari aset asli `public/images/SPINWHEEL.png` (6750 x 6750).
 *
 * Rodanya tampil 300 px logis, jadi 750 px sudah cukup bahkan di layar DPR 2,5;
 * 1500 px memberi ruang lega. Yang aslinya 5,6 MB - berat sekali untuk pemain
 * yang bermain dari ponsel. Versi ini 228 KB.
 *
 * Angka-angka geometri di bawah diukur ulang pada berkas turunan ini dan cocok
 * dengan aslinya sampai di bawah satu piksel pada ukuran tampil.
 */
export const RODA_SRC = "/images/merdeka-wheel.png";

/**
 * Letak piringan dan jarum di dalam gambar, sebagai pecahan dari sisi gambar.
 *
 * Diukur dari berkasnya: piksel tak-transparan di baris tengah membentang
 * 858/900 lebar (diameter), dan bagian atas gambar sampai 4,9% tingginya hanya
 * berisi segitiga jarum - lingkarannya baru mulai di bawah itu.
 *
 * Ini penting karena JARUMNYA IKUT TERGAMBAR DI PNG yang sama. Kalau seluruh
 * gambar diputar, jarumnya ikut berputar dan tidak menunjuk apa pun. Jadi
 * piringan digambar terkurung lingkaran ini lalu diputar, sementara jarumnya
 * digambar ulang di atasnya tanpa diputar.
 */
export const RODA_CX = 0.4994;
export const RODA_CY = 0.5239;
export const RODA_R = 0.4756;

/** Kotak sumber segitiga jarum, juga dalam pecahan sisi gambar. */
export const RODA_JARUM = { x: 0.44, y: 0, w: 0.12, h: 0.052 };

/**
 * Roda punya 9 juring sama besar. Juring 0 tepat di bawah jarum saat rotasi 0,
 * lalu nomornya naik searah jarum jam. Diukur dari gambarnya sendiri dengan
 * memindai warna melingkar - batas juringnya jatuh di kelipatan 40 derajat.
 */
export const JUMLAH_JURING = 9;
export const DERAJAT_PER_JURING = 360 / JUMLAH_JURING;

/**
 * Sudut akhir supaya juring `slot` berhenti di bawah jarum.
 *
 * Nomor juring naik searah jarum jam, jadi rodanya diputar berlawanan sebanyak
 * itu. `putaran` menambah lingkaran penuh biar terlihat berputar dulu, dan
 * `geser` menaruh titik henti sedikit meleset dari tengah juring supaya tidak
 * terasa seperti berhenti di rel yang sama tiap kali.
 */
export function sudutUntukSlot(slot: number, putaran = 6): number {
  const kelipatan = ((slot % JUMLAH_JURING) + JUMLAH_JURING) % JUMLAH_JURING;
  // Sisakan tepian 6 derajat di kedua sisi supaya jarum tidak pernah berhenti
  // pas di garis pemisah - dari luar itu terbaca sebagai hasil yang ambigu.
  const geser = (Math.random() - 0.5) * (DERAJAT_PER_JURING - 12);
  return putaran * 360 + (360 - kelipatan * DERAJAT_PER_JURING) + geser;
}

// -- Palet -------------------------------------------------------------------

/** Warna poster tujuh-belasan, disalin dari demo artifact. */
export const WARNA = {
  merah: "#E23A3A",
  merahTua: "#A8232B",
  putih: "#FFF4E8",
  emas: "#F2B33D",
  emasTua: "#B87F16",
  garis: "#080D22",
  mint: "#4FD1A0",
} as const;

// -- Dus sepatu --------------------------------------------------------------

export type TandaMerek = "swoosh" | "stripes" | "spiral" | "nb" | "salomon";

export interface MerekDus {
  id: string;
  nama: string;
  /** Warna tutup dus. */
  tutup: string;
  /** Badan dus, selalu lebih gelap dari tutupnya. */
  badan: string;
  /** Warna logo + wordmark di tutup. */
  tinta: string;
  tanda: TandaMerek;
  /** Warna label ukuran di ujung kanan badan dus. */
  label: string;
}

/**
 * Dus sepatu digambar ulang di kanvas memakai warna kemasan ritel tiap merek.
 * Urutannya berputar tiap tingkat, jadi menara yang tersusun terlihat seperti
 * tumpukan dus asli, bukan balok warna-warni.
 */
export const MEREK_DUS: MerekDus[] = [
  {
    id: "nike",
    nama: "NIKE",
    tutup: "#F4692A",
    badan: "#D2521A",
    tinta: "#FFFFFF",
    tanda: "swoosh",
    label: "#FFF4E8",
  },
  {
    id: "adi",
    nama: "adidas",
    tutup: "#16305E",
    badan: "#0E2244",
    tinta: "#FFFFFF",
    tanda: "stripes",
    label: "#E8ECF6",
  },
  {
    id: "asics",
    nama: "ASICS",
    tutup: "#EFF2F7",
    badan: "#D3D9E4",
    tinta: "#1B4CA1",
    tanda: "spiral",
    label: "#1B4CA1",
  },
  {
    id: "nb",
    nama: "New Balance",
    tutup: "#C9CDD4",
    badan: "#A7ADB8",
    tinta: "#C8102E",
    tanda: "nb",
    label: "#FFFFFF",
  },
  {
    id: "salo",
    nama: "SALOMON",
    tutup: "#14161A",
    badan: "#0A0C0F",
    tinta: "#FFFFFF",
    tanda: "salomon",
    label: "#D8DEE6",
  },
];

/**
 * Umur token verifikasi email pemenang barang, dalam jam.
 *
 * Cerminan `CLAIM_TOKEN_TTL_HOURS` di backend
 * (`src/common/constants/merdeka-game.ts`). Angkanya cuma dipakai untuk
 * salinan teks di layar kemenangan - yang menegakkan batas waktunya tetap
 * server. Ubah dua-duanya bareng kalau masa berlakunya diganti.
 */
export const CLAIM_TOKEN_TTL_HOURS = 24;
