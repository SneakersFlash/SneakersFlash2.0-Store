/**
 * Angka-angka game Kemerdekaan "The 17-Box Climb".
 *
 * Kembaran berkas ini ada di backend (`src/common/constants/merdeka-game.ts`).
 * Kalau salah satu diubah, ubah keduanya - backend yang berhak menolak ronde,
 * jadi angka di sini cuma dipakai untuk menampilkan aturan dan menyetel animasi.
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

// -- Latar (public/images/BGjpg, 1260 x 7750) --------------------------------

export const BG_SRC = "/images/BGjpg";
export const BG_W_ASLI = 1260;
export const BG_H_ASLI = 7750;

/**
 * Posisi garis rumput di dalam gambar, diukur dari hasil pemindaian baris:
 * warna berubah tajam dari langit ke rumput pada 96,2% tinggi gambar.
 * Dus paling bawah berdiri persis di garis ini.
 */
export const BG_RASIO_TANAH = 0.962;

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

/**
 * Kamera saat dus terakhir tersusun. Dipakai memetakan perjalanan latar:
 * kamera 0 = dasar gambar (rumput), kamera maksimum = puncak gambar (langit malam).
 */
export const KAMERA_MAKS = (TARGET_DUS - 1) * TINGGI_DUS;

// -- Roda hadiah (public/images/SPINWHEEL.png, 6750 x 6750) ------------------

export const RODA_SRC = "/images/SPINWHEEL.png";

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

// -- Warna dus ---------------------------------------------------------------

/** Dus sepatu bergiliran memakai warna kotak merek. */
export const WARNA_DUS = [
  { badan: "#F4692A", tepi: "#C7501B", tulisan: "#FFFFFF" }, // Nike
  { badan: "#16305E", tepi: "#0D1F3F", tulisan: "#FFFFFF" }, // adidas
  { badan: "#EFF2F7", tepi: "#1B4CA1", tulisan: "#16305E" }, // ASICS
  { badan: "#C9CDD4", tepi: "#9AA1AC", tulisan: "#2A2F36" }, // New Balance
  { badan: "#14161A", tepi: "#000000", tulisan: "#FFFFFF" }, // Salomon
];

/** Merah kampanye Freedom in Every Step. Dipakai HUD dan tombol game. */
export const MERAH_MERDEKA = "#9E0107";
