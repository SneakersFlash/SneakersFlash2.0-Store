"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import { vouchersService } from "@/lib/api/vouchers.service";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  SIGNUP_POINTS_PROMO,
  isSignupPointsPromoActive,
} from "@/lib/utils/signupPromo";
import {
  FREEDOM_BERAKHIR,
  FREEDOM_HREF,
  FREEDOM_VOUCHER_KODE,
} from "@/lib/campaign/freedom-in-every-step";

// Sama persis dengan enum DiscountType di Prisma (huruf kecil, snake_case).
export type DiscountType = "percentage" | "fixed_amount" | "free_shipping";

export interface Voucher {
  id: string;
  campaignId: string;
  userId?: string | null;
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number | null;
  minPurchaseAmount: number;
  usageLimitTotal?: number | null;
  usageLimitPerUser: number;
  startAt: string;
  expiresAt: string;
  isActive: boolean;
}

// "jt", BUKAN "M": dalam bahasa Indonesia M dibaca miliar, jadi "Rp1M" untuk
// 1.000.000 justru menyesatkan (kebaca 1 miliar). Pecahan pakai koma sesuai
// locale id-ID, jadi 1.500.000 tampil "Rp1,5jt" bukan "Rp1.5jt".
const ringkas = (n: number) =>
  n.toLocaleString("id-ID", { maximumFractionDigits: 1 });

const formatRp = (value: number | string) => {
  const angka = Number(value) || 0;
  if (angka >= 1_000_000) return `Rp${ringkas(angka / 1_000_000)}JT`;
  if (angka >= 1_000)     return `Rp${ringkas(angka / 1_000)}RB`;
  return `Rp${angka.toLocaleString("id-ID")}`;
};

// Versi kolom kanan: tanpa "Rp" dan dieja penuh biar nendang seperti banner
// promo — 150.000 → "150RIBU", 1.500.000 → "1,5JUTA".
const formatNominal = (value: number | string) => {
  const angka = Number(value) || 0;
  if (angka >= 1_000_000) return `${ringkas(angka / 1_000_000)}JUTA`;
  if (angka >= 1_000)     return `${ringkas(angka / 1_000)}RIBU`;
  return `Rp${angka.toLocaleString("id-ID")}`;
};

// Decimal(15,2) dari backend bisa berupa 4 atau 4.00, jadi pecahan .00 dibuang
// dan sisanya pakai koma id-ID (12.5 → "12,5%").
const formatPersen = (value: number | string) =>
  `${(Number(value) || 0).toLocaleString("id-ID", { maximumFractionDigits: 2 })}%`;

const MOCK_FIRSTSTEP_VOUCHER = {
  id: "__mock_firststep__",
  code: "FIRSTSTEP-••••",
  name: "Voucher Registrasi",
  description: "Khusus member baru! Daftar sekarang dan dapatkan voucher ini.",
  discountType: "fixed_amount" as DiscountType,
  discountValue: 100000,
  minPurchaseAmount: 1000000,
  maxDiscountAmount: null,
  expiresAt: "2030-12-31T23:59:59.000Z",
  isMock: true,
};

// Selama promo Kemerdekaan hadiah member baru bukan voucher lagi, tapi poin —
// kartu ini yang tampil supaya janji di home sama dengan yang dikirim backend.
const MOCK_SIGNUP_POINTS = {
  id: "__mock_signup_points__",
  code: "MERDEKA-••••",
  name: "FREEDOM IN STEP",
  description: "Khusus member baru! Poin langsung masuk saldo FlashPoint.",
  discountType: "fixed_amount" as DiscountType,
  discountValue: SIGNUP_POINTS_PROMO.amount,
  minPurchaseAmount: 0,
  maxDiscountAmount: null,
  expiresAt: SIGNUP_POINTS_PROMO.endAt.toISOString(),
  isMock: true,
  isPoints: true,
  // Badge kedua, di samping "NEW MEMBER".
  badgePromo: "MERDEKA SPECIAL",
  // Kolom kanan ditumpuk ("81K" di atas "FLASHPOINT") karena lebarnya cuma
  // 80-90px — satu baris penuh bakal mengecil sampai tidak terbaca.
  nilaiRingkas: "81K",
  satuanNilai: "FLASHPOINT",
  periodeKlaim: "Klaim 13 - 17 Agustus",
};

// Bocoran voucher campaign — tampil SEBELUM voucher aslinya bisa diklaim.
//
// Voucher FREEDOM17 baru mulai 15 Agt, dan daftar klaim backend hanya memuat
// voucher yang sudah mulai. Tanpa kartu ini promonya tidak kelihatan sama
// sekali sampai hari-H, padahal campaign-nya sudah tayang sejak 12 Agt.
// Kartu ini tidak bisa diklaim: menekannya membawa ke halaman campaign.
const MOCK_FREEDOM17 = {
  id: "__mock_freedom17__",
  code: FREEDOM_VOUCHER_KODE,
  name: "Voucher 17% No Max Cap",
  description: "Potongan 17% tanpa batas maksimum, khusus produk campaign.",
  discountType: "percentage" as DiscountType,
  discountValue: 17,
  minPurchaseAmount: 0,
  maxDiscountAmount: null,
  expiresAt: FREEDOM_BERAKHIR,
  isMock: true,
  isComingSoon: true,
  badgePromo: "MERDEKA SPECIAL",
  periodeKlaim: "Klaim 15 - 17 Agustus",
};

interface VoucherClaimSectionProps {
  /** Judul section. Default-nya teks yang dipakai home page. */
  title?: string;
  /** Baris penjelas di bawah judul. Tidak dirender kalau kosong. */
  subtitle?: string;
}

export default function VoucherClaimSection({
  title = "Claim Shopping Vouchers",
  subtitle,
}: VoucherClaimSectionProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { isAuthenticated } = useAuthStore();

  const [vouchers, setVouchers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimedVouchers, setClaimedVouchers] = useState<string[]>([]);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setIsLoading(true);
        const data = isAuthenticated
          ? await vouchersService.getClaimableVouchers()
          : await vouchersService.getAvailableVouchers();
        setVouchers(data);
      } catch (error) {
        console.error("Gagal memuat daftar voucher:", error);
        toast.error("Gagal memuat daftar voucher promo.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchVouchers();
  }, [isAuthenticated]);

  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-40px" });

  const handleClaim = async (id: string, isMock?: boolean, isComingSoon?: boolean) => {
    // Bocoran voucher campaign: belum ada yang bisa diklaim, jadi arahkan ke
    // halaman campaign-nya alih-alih ke pendaftaran.
    if (isComingSoon) {
      toast.info("Voucher 17% dibuka 15 Agustus 00:00 WIB. Siapkan keranjangmu!");
      router.push(FREEDOM_HREF);
      return;
    }

    if (!isAuthenticated || isMock) {
      toast.error(
        isSignupPointsPromoActive()
          ? `Daftar sekarang dan dapatkan ${SIGNUP_POINTS_PROMO.amount.toLocaleString("id-ID")} FlashPoint!`
          : "Daftar sekarang untuk mendapatkan voucher selamat datang!",
      );
      router.push(`/register`);
      return;
    }

    try {
      setClaimingId(id);
      const response = await vouchersService.claimVoucher(id);
      toast.success(response.message || "Voucher berhasil diklaim!");
      setClaimedVouchers((prev) => [...prev, id]);
    } catch (error: any) {
      const msg = error.response?.data?.message || "Gagal mengklaim voucher.";
      toast.error(msg);
    } finally {
      setClaimingId(null);
    }
  };

  const listVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, x: 40, scale: 0.95 },
    visible: {
      opacity: 1, x: 0, scale: 1,
      transition: { type: "spring", stiffness: 260, damping: 20 },
    },
  };

  const isFirstStep = (v: any) =>
  v.code?.toUpperCase().includes("FIRSTSTEP") ||
  v.name?.toUpperCase().includes("FIRST STEP") ||
  v.name?.toUpperCase().includes("FIRSTSTEP");

  // Kartu hadiah member baru mengikuti jendela promo — setelah 17 Agt WIB
  // otomatis balik ke kartu voucher, tanpa perlu deploy ulang.
  const kartuMemberBaru = isSignupPointsPromoActive()
    ? MOCK_SIGNUP_POINTS
    : MOCK_FIRSTSTEP_VOUCHER;

  // Kartu bocoran FREEDOM17 dipasang paling depan selama voucher aslinya belum
  // muncul di daftar dan campaign-nya belum lewat. Begitu yang asli terbit
  // (15 Agt) daftar dari backend memuat kodenya dan bocorannya menyingkir —
  // tanpa perlu deploy ulang. Seluruh keputusan ini terjadi sesudah data voucher
  // tiba di klien (render awal masih "Memuat voucher..."), jadi tidak ada beda
  // antara render server dan klien.
  const freedomAsliSudahTerbit = vouchers.some(
    (v) => v.code?.toUpperCase() === FREEDOM_VOUCHER_KODE,
  );
  const kartuFreedom =
    !freedomAsliSudahTerbit && Date.now() < Date.parse(FREEDOM_BERAKHIR)
      ? [MOCK_FREEDOM17]
      : [];

  const displayVouchers = !isAuthenticated
    ? [...kartuFreedom, kartuMemberBaru, ...vouchers.filter(v => !isFirstStep(v))]
    : [...kartuFreedom, ...vouchers];

  return (
    <section className="w-full bg-[#F5F5F5] pb-4 pt-2 md:py-6" ref={containerRef}>
      <div className="container px-1 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col gap-1 mb-3 md:mb-4"
        >
          <p className="text-[18px] md:text-[22px] font-black tracking-tight text-gray-900">
            {title}
          </p>
          {subtitle && (
            <p className="text-[12px] md:text-[13px] text-gray-500 leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </motion.div>

        <motion.div
          variants={listVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex gap-3 lg:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-4 pt-2 -my-2 px-1"
        >
          {isLoading ? (
            <div className="w-full text-center text-sm text-gray-500 py-4">Memuat voucher...</div>
          ) : displayVouchers.length === 0 ? (
            <div className="w-full text-center text-sm text-gray-500 py-4">
              Belum ada voucher promo saat ini.
            </div>
          ) : (
            displayVouchers.map((voucher) => {
              const isMock = (voucher as any).isMock === true;
              const isPoints = (voucher as any).isPoints === true;
              const isComingSoon = (voucher as any).isComingSoon === true;
              const isClaimed = !isMock && (voucher.isClaimed || claimedVouchers.includes(voucher.id));
              const isClaimingThis = claimingId === voucher.id;

              const tipeDiskon = voucher.discountType?.toLowerCase();
              const batasDiskon = voucher.maxDiscountAmount
                ? Number(voucher.maxDiscountAmount)
                : null;

              // "Diskon 4% s.d. Rp150RB Min. Blj Rp2JT" — kecuali kartu poin,
              // yang bukan diskon dan tidak punya minimum belanja.
              // Nominalnya sudah jadi headline di kolom kanan, jadi baris ini
              // dibuat pendek — kalau ikut menyebut "81.000 FlashPoint" dia
              // wrap jadi dua baris dan kartu 90px kelebihan tinggi.
              const deskripsiDiskon = isPoints
                ? "Tanpa min. belanja"
                : [
                tipeDiskon === "free_shipping"
                  ? "Gratis Ongkir"
                  : `Diskon ${
                      tipeDiskon === "percentage"
                        ? formatPersen(voucher.discountValue)
                        : formatRp(voucher.discountValue)
                    }`,
                tipeDiskon === "percentage" && batasDiskon
                  ? `s.d. ${formatRp(batasDiskon)}`
                  : "",
                // Voucher tanpa batas maksimum layak disebut apa adanya — itu
                // justru daya tariknya, bukan sesuatu yang perlu disembunyikan.
                tipeDiskon === "percentage" && !batasDiskon
                  ? "tanpa max cap"
                  : "",
                // "Min. Blj Rp0" itu membingungkan; kalau tidak ada minimumnya,
                // katakan begitu.
                Number(voucher.minPurchaseAmount) > 0
                  ? `Min. Blj ${formatRp(voucher.minPurchaseAmount)}`
                  : "Tanpa min. belanja",
              ]
                .filter(Boolean)
                .join(" ");

              // Kolom kanan pasang angka rupiah terbesar yang bisa didapat:
              // voucher persen dipatok batasnya ("UP TO 150RIBU"), bukan "4%"
              // yang tak berarti apa-apa sebagai headline.
              const pakaiUpTo = tipeDiskon === "percentage" && !!batasDiskon;
              // Kartu poin punya render sendiri di kolom kanan (nilai + satuan
              // ditumpuk), jadi nilaiUtama hanya dipakai kartu voucher.
              const nilaiUtama = pakaiUpTo
                ? formatNominal(batasDiskon as number)
                : tipeDiskon === "percentage"
                  ? formatPersen(voucher.discountValue)
                  : tipeDiskon === "free_shipping"
                    ? "GRATIS ONGKIR"
                    : formatNominal(voucher.discountValue);
              // Label panjang dikecilkan supaya muat kolom 80–90px.
              const isLabelPanjang = nilaiUtama.length > 8;

              // Semua kartu merah seperti kartu mock — tidak ada lagi varian orange.
              const accentStrip = "bg-gray-500";
              const buttonClass = isClaimed
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : isClaimingThis
                  ? "bg-red-500/70 text-white cursor-wait"
                  : "bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-200";

              return (
                <motion.div
                  key={voucher.id}
                  variants={cardVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="snap-start shrink-0"
                >
                  {/* ── Card — struktur & ukuran identik, beda warna strip ── */}
                  <div className="w-[260px] md:w-[320px] bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex relative overflow-hidden h-[90px] md:h-[100px] hover:shadow-lg transition-shadow duration-300">

                    {/* Left color strip */}
                    <div className={cn("w-2 h-full shrink-0", accentStrip)} />

                    {/* Main info */}
                    <div className={cn(
                      "flex-1 px-1 md:px-4 flex flex-col justify-center border-r-2 border-dashed border-gray-200 relative min-w-0",
                      // Kartu poin punya satu baris ekstra (periode klaim),
                      // jadi paddingnya dirapatkan supaya tetap muat 90px.
                      isPoints ? "py-1.5" : "py-2.5",
                    )}>
                      {/* Ticket notch top & bottom */}
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#F5F5F5] rounded-full border-b border-l border-gray-100" />
                      <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-[#F5F5F5] rounded-full border-t border-l border-gray-100" />

                      {/* Badge "Member Baru" hanya di mock; kartu promo punya
                          badge kedua di sampingnya. Keduanya nowrap supaya di
                          kartu 260px tidak pecah jadi dua baris. */}
                      {isMock && (
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-[8px] font-black bg-red-50 text-red-500 border border-red-100 rounded-full px-2 py-0.5 uppercase tracking-wider whitespace-nowrap">
                            {isComingSoon ? "SEGERA" : "NEW MEMBER"}
                          </span>
                          {(voucher as any).badgePromo && (
                            <span className="text-[8px] font-black bg-gray-900 text-white rounded-full px-2 py-0.5 uppercase tracking-wider whitespace-nowrap">
                              {(voucher as any).badgePromo}
                            </span>
                          )}
                        </div>
                      )}

                      <h4 className="font-bold text-[13px] md:text-[15px] text-gray-900 leading-tight mb-1 truncate">
                        {voucher.name}
                      </h4>

                      {/* Sengaja tanpa truncate: di layar kecil baris ini wrap
                          jadi dua baris, dan tinggi kartu masih cukup. */}
                      <p className="text-[10px] md:text-[11px] text-gray-500 font-medium leading-snug">
                        {deskripsiDiskon}
                      </p>

                      {/* Kartu promo pasang periode klaim; mock voucher biasa
                          tidak punya baris bawah, reguler pakai tanggal expired */}
                      {isMock ? (
                        (voucher as any).periodeKlaim ? (
                          <p className="text-[9px] md:text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {(voucher as any).periodeKlaim}
                          </p>
                        ) : null
                      ) : (
                        <p className="text-[9px] md:text-[10px] text-gray-400 mt-auto flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Ends {new Date(voucher.expiresAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </p>
                      )}
                    </div>

                    {/* Right action */}
                    <div className="w-[80px] md:w-[90px] bg-white flex flex-col items-center justify-center px-2 z-10">
                      <div className="mb-1.5 text-center leading-none">
                        {pakaiUpTo && (
                          <p className="text-[7px] md:text-[8px] font-bold uppercase tracking-wider text-gray-400">
                            Up To
                          </p>
                        )}
                        {isPoints ? (
                          <>
                            <p className="font-black text-gray-900 leading-tight text-[16px] md:text-[18px]">
                              {(voucher as any).nilaiRingkas}
                            </p>
                            <p className="text-[7px] md:text-[8px] font-black uppercase tracking-wider text-red-500 mt-0.5">
                              {(voucher as any).satuanNilai}
                            </p>
                          </>
                        ) : (
                          <p
                            className={cn(
                              "font-black text-gray-900 leading-tight",
                              pakaiUpTo && "mt-0.5",
                              isLabelPanjang
                                ? "text-[9px] md:text-[10px]"
                                : "text-[12px] md:text-[14px]",
                            )}
                          >
                            {nilaiUtama}
                          </p>
                        )}
                      </div>
                      <motion.button
                        whileTap={isClaimed || isClaimingThis ? {} : { scale: 0.9 }}
                        onClick={() => handleClaim(voucher.id, isMock || undefined, isComingSoon || undefined)}
                        disabled={isClaimed || isClaimingThis}
                        className={cn(
                          "w-full py-1.5 md:py-2 rounded-full text-[10px] md:text-[11px] font-bold transition-all duration-300 shadow-lg",
                          buttonClass
                        )}
                      >
                        {isClaimingThis
                          ? "..."
                          : isClaimed
                            ? "Diklaim"
                            : isComingSoon
                              ? "Lihat"
                              : isMock
                                ? "Daftar"
                                : "Klaim"}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
    </section>
  );
}