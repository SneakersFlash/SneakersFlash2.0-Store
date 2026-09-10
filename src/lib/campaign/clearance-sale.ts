/**
 * Sumber tunggal data Clearance Sale untuk komponen DI LUAR halaman eventnya.
 *
 * Halaman /events/clearance-sale sendiri mengambil semuanya dari backend
 * (judul, banner, hitung mundur) dan tidak memakai berkas ini. Pop-up beranda
 * tidak bisa begitu: ia cuma hidup 5 detik, jadi menunggu satu panggilan API
 * dulu berarti separuh umurnya habis sebelum kartunya tampil.
 *
 * CATATAN (dicek 10 Sep 2026): banner event yang tersimpan di admin menunjuk
 * akun Cloudinary yang sudah dinonaktifkan — `res.cloudinary.com/ds2hpv3bl`
 * menjawab 401 "cloud_name ds2hpv3bl is disabled". Karena itu pop-up sengaja
 * TIDAK memakai gambar banner sama sekali; kalau nanti bannernya dibenahi,
 * barulah masuk akal menariknya dari API.
 *
 * Kalau tanggal event di admin digeser, ubah `CLEARANCE_BERAKHIR` juga. Kalau
 * tidak, pop-up bisa hidup lebih lama daripada eventnya — halaman eventnya
 * sendiri sudah mengalihkan ke beranda begitu event dimatikan, jadi pop-up
 * yang tertinggal akan mengantar orang ke beranda lagi.
 */

/** Tujuan klik pop-up. Slug event, bukan halaman kurasi tangan. */
export const CLEARANCE_HREF = "/events/clearance-sale";

export const CLEARANCE_NAMA = "Clearance Sale";

/**
 * WIB (+07:00) ditulis eksplisit supaya tidak ikut zona waktu server —
 * kontainer app berjalan di UTC. Nilainya = `countDownEnd` event id 5 di
 * backend (2026-09-30T16:59:59Z).
 */
export const CLEARANCE_BERAKHIR = "2026-09-30T23:59:59+07:00";

export const CLEARANCE_PERIODE = "Berakhir 30 September 2026";

/**
 * Diskon tertinggi yang benar-benar ada di katalog event, bukan angka hiasan:
 * potongan terbesar di payload event 10 Sep 2026 adalah 77%, jadi "up to 70%"
 * aman diklaim.
 */
export const CLEARANCE_DISKON = "Disc. Up To 70%";
