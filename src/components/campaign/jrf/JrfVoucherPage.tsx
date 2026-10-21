"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { AxiosError } from "axios";
import { apiClient } from "@/lib/api/client";
import "./jrf.css";

/**
 * Halaman klaim voucher JRF 2026, disalin dari index.html di
 * jrf-voucher-handoff.zip (copy tidak boleh diubah). Bedanya cuma:
 * verifyClaim() demo diganti POST /jrf/claim, dan wordmark teks di navbar
 * diganti logo Sneakers Flash putih.
 */

const CAMPAIGN = {
  claimStart: new Date("2026-10-22T00:00:00+07:00"),
  claimEnd: new Date("2026-10-29T23:59:59+07:00"),
  minPurchase: 2000000,
};
const TIERS: Record<string, { label: string; nominal: number }> = {
  "5K": { label: "5K", nominal: 150000 },
  "10K": { label: "10K", nominal: 250000 },
  HM: { label: "HM · 21K", nominal: 350000 },
  FM: { label: "FM · 42K", nominal: 500000 },
};
const FAQ: [string, string][] = [
  ["Siapa yang bisa claim voucher ini?", "Voucher ini khusus peserta yang terdaftar di JRF 2026, untuk kategori 5K, 10K, Half Marathon, dan Marathon."],
  ["Gimana cara claim voucher-nya?", "Isi formulir, masukkan nomor BIB dan kategori race, lalu upload screenshot bukti kepesertaan dari aplikasi JRF. Setelah data berhasil diverifikasi, kode voucher muncul."],
  ["Bisa claim sebelum hari race?", "Bisa! Klaim dibuka mulai 22 Oktober 2026, sebelum race berlangsung."],
  ["Sampai kapan voucher bisa diklaim dan dipakai?", "Klaim dibuka 22-29 Oktober 2026. Voucher dapat digunakan selama 14 hari sejak klaim; cek tanggal kedaluwarsa pada kode voucher."],
  ["Voucher berlaku untuk produk apa saja?", "Voucher berlaku untuk produk yang memenuhi ketentuan dengan minimum belanja Rp2.000.000. Apparel dan produk clearance sale dikecualikan."],
  ["Voucher bisa dipakai di marketplace?", "Nggak. Voucher ini khusus untuk transaksi melalui sneakersflash.com."],
  ["Belum punya screenshot atau BIB nggak cocok?", "Cek halaman tiket / My Race di aplikasi JRF dan pastikan data serta screenshot terlihat jelas. Kalau masih terkendala, hubungi Customer Service Sneakers Flash."],
];
const ERRORS: Record<string, string> = {
  BIB_USED: "Nomor BIB ini sudah pernah digunakan untuk claim voucher.",
  DATA_MISMATCH: "Data belum berhasil diverifikasi. Cek kembali nama, nomor BIB, kategori race, dan bukti peserta.",
  BAD_SCREENSHOT: "Screenshot kurang jelas atau tidak sesuai. Coba upload ulang bukti kepesertaan dari aplikasi JRF.",
  // Tidak ada di brief: tanpa ini klaim sebelum 22 Okt mendapat copy "sudah berakhir".
  NOT_OPEN: "Claim voucher JRF 2026 dibuka mulai 22 Oktober 2026 pukul 00.00 WIB.",
  CLOSED: "Periode claim voucher JRF 2026 sudah berakhir pada 29 Oktober 2026.",
  DEFAULT: "Terjadi kendala. Coba lagi sebentar, ya.",
};

type ClaimResult = { ok: true; code: string; category: string; nominal: number; expiredAt: string };

const rp = (n: number) => "Rp" + n.toLocaleString("id-ID");
const rpK = (n: number) => "Rp" + n / 1000 + "K";
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

async function verifyClaim(fd: FormData): Promise<ClaimResult> {
  try {
    // Content-Type dihapus supaya browser menulis boundary multipart sendiri.
    const res = await apiClient.post<ClaimResult>("/jrf/claim", fd, {
      headers: { "Content-Type": undefined },
      timeout: 60_000,
    });
    return res.data;
  } catch (e) {
    const code = (e as AxiosError<{ code?: string }>).response?.data?.code;
    throw new Error(code && ERRORS[code] ? code : "DEFAULT");
  }
}

const Check = ({ stroke, size, width }: { stroke: string; size: number; width: number }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
);

export function JrfVoucherPage() {
  const [nama, setNama] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [bib, setBib] = useState("");
  const [cat, setCat] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileBad, setFileBad] = useState(false);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ClaimResult | null>(null);
  const [popup, setPopup] = useState(false);
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const doneCopyRef = useRef<HTMLButtonElement>(null);

  const tier = TIERS[cat];
  const valid =
    nama.trim().length > 1 &&
    bib.trim().length > 0 &&
    !!cat &&
    phone.replace(/\D/g, "").length >= 9 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    !!file &&
    agree;

  useEffect(() => {
    if (!popup) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, [popup]);

  const closePopup = () => {
    setPopup(false);
    setTimeout(() => doneCopyRef.current?.focus(), 0);
  };

  const onFile = (f: File | undefined, input: HTMLInputElement) => {
    const ok = !!f && /image\/(png|jpe?g)/.test(f.type) && f.size <= 5 * 1024 * 1024;
    setFile(ok ? f! : null);
    setFileBad(!!f && !ok);
    if (!ok) input.value = "";
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!valid || busy) return;
    setError("");
    const now = new Date();
    if (now > CAMPAIGN.claimEnd) {
      setError(ERRORS.CLOSED);
      return;
    }
    // Sebelum dibuka tetap dikirim: login admin boleh menguji lebih awal,
    // dan server yang memutuskan (membalas NOT_OPEN untuk pengunjung biasa).
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    fd.set("bib", bib.trim());
    fd.set("category", cat);
    fd.set("screenshot", file!);
    try {
      setResult(await verifyClaim(fd));
      setPopup(true);
    } catch (x) {
      setError(ERRORS[(x as Error).message] || ERRORS.DEFAULT);
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result!.code);
    } catch {}
    setCopied(true);
  };

  const who = `${nama.trim()} - BIB ${bib.trim()}`;

  return (
    <div className="jrf">
      <header className="top">
        <div className="wrap">
          <div className="brand">
            <Link className="logo" href="/" aria-label="Sneakers Flash">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="logo-img" src="/images/logo-wordmark-white-600.png" alt="Sneakers Flash" />
            </Link>
            <span className="brand-div" aria-hidden="true"></span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="brand-jrf" src="/images/jrf/jrf-logo.png" alt="Jakarta Running Fest 2026" />
          </div>
          <span className="pill tag">JRF 2026 · RUNNER EXCLUSIVE</span>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="wrap">
            <div className="hero-copy">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/jrf/jrf-logo.png" alt="Jakarta Running Fest 2026" width={260} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
              <div className="eyebrow">
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                EXCLUSIVE FOR JRF 2026 RUNNERS
              </div>
              <h1 className="display">Run your race.<br />Claim your reward.</h1>
              <p className="lead">Ikut JRF 2026? Sneakers Flash punya voucher spesial buat lo! Daftar pakai data kepesertaan JRF, claim sesuai kategori race, lalu belanja di sneakersflash.com.</p>
              <div className="ticket">
                <div className="ticket-main">
                  <span className="k">{tier ? "EXCLUSIVE VOUCHER " + cat : "EXCLUSIVE VOUCHER"}</span>
                  <span className="big">{tier ? rpK(tier.nominal) + " OFF" : "UP TO Rp500K"}</span>
                  <span className="small">Min. belanja Rp2.000.000 · Claim 22-29 Oktober 2026</span>
                  <span className="small" style={{ fontSize: 12 }}>*T&amp;C apply</span>
                </div>
                <div className="ticket-stub">
                  <span className="k" style={{ fontSize: 11 }}>1 BIB</span>
                  <span className="display" style={{ fontSize: 28 }}>=1</span>
                  <span className="k" style={{ fontSize: 11 }}>VOUCHER</span>
                </div>
              </div>
            </div>

            <div className="card" id="claim">
              <form noValidate onSubmit={onSubmit} hidden={!!result}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <h2 className="display" style={{ margin: 0, fontSize: 34 }}>Claim your voucher</h2>
                  <p className="help" style={{ fontSize: 14, margin: 0 }}>Isi data sesuai aplikasi JRF untuk mendapatkan voucher berdasarkan kategori race lo.</p>
                </div>

                <div className="field">
                  <label htmlFor="nama">Nama Lengkap</label>
                  <input className="input" id="nama" name="nama" type="text" autoComplete="name" placeholder="Nama sesuai registrasi JRF" required value={nama} onChange={(e) => setNama(e.target.value)} />
                </div>

                <div className="field">
                  <div className="row">
                    <div className="field">
                      <label htmlFor="phone">Nomor WhatsApp</label>
                      <input className="input" id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="08xx xxxx xxxx" required value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="field">
                      <label htmlFor="email">Email</label>
                      <input className="input" id="email" name="email" type="email" autoComplete="email" placeholder="nama@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <span className="help">Pastikan kontak yang diisi aktif.</span>
                </div>

                <div className="field">
                  <label htmlFor="bib">Nomor BIB</label>
                  <input className="input bib" id="bib" name="bib" type="text" inputMode="numeric" placeholder="Masukkan nomor BIB lo" required value={bib} onChange={(e) => setBib(e.target.value.toUpperCase())} />
                </div>

                <fieldset>
                  <legend>Kategori race</legend>
                  <div className="cats">
                    {Object.entries(TIERS).map(([id, t]) => (
                      <button key={id} type="button" className="cat" aria-pressed={cat === id} onClick={() => setCat(id)}>
                        <b>{t.label}</b>
                        <span>{rp(t.nominal)}</span>
                      </button>
                    ))}
                  </div>
                  {tier && (
                    <div className="preview">
                      <Check stroke="#1E3FE0" size={16} width={2.5} />
                      <span>Voucher <strong>{cat}</strong> lo: <strong>{rp(tier.nominal)}</strong> · min. belanja {rp(CAMPAIGN.minPurchase)}</span>
                    </div>
                  )}
                </fieldset>

                <div className="field">
                  <span className="lbl">Upload Screenshot Aplikasi JRF</span>
                  <label className={`drop${file ? " has" : ""}${fileBad ? " bad" : ""}`} htmlFor="shot">
                    <input id="shot" type="file" accept="image/png,image/jpeg" onChange={(e) => onFile(e.target.files?.[0], e.target)} />
                    <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1E3FE0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></svg>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{file ? file.name : "Tap untuk upload screenshot."}</span>
                    <span className="small">{file ? "Tap untuk ganti file" : "JPG/PNG, maks. 5 MB."}</span>
                  </label>
                  <span className="msg-err" role="alert" hidden={!fileBad}>Gunakan file JPG atau PNG dengan ukuran maksimal 5 MB.</span>
                  <span className="msg-ok" hidden={!file}>Screenshot berhasil di-upload.</span>
                  <span className="help">Tampilkan nama, BIB, dan status peserta dengan jelas.</span>
                </div>

                <label className="consent">
                  <input type="checkbox" id="agree" name="agree" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                  <span>Saya telah membaca dan menyetujui <a href="#sk">Syarat &amp; Ketentuan</a> serta <Link href="/privacy-policy">Kebijakan Privasi</Link> Sneakers Flash.</span>
                </label>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button className="btn" type="submit" disabled={!valid || busy}>{busy ? "MEMVERIFIKASI…" : "CLAIM VOUCHER SEKARANG"}</button>
                  <span className="status" role="status" hidden={!busy}>Lagi verifikasi data lo. Tunggu sebentar, ya!</span>
                  <span className="msg-err" role="alert" hidden={!error} style={{ textAlign: "center" }}>{error}</span>
                </div>
              </form>

              {result && (
                <div className="done">
                  <div className="check"><Check stroke="#11723A" size={28} width={2.5} /></div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <h2 className="display" style={{ margin: 0, fontSize: 34 }}>Your reward is unlocked!</h2>
                    <p className="help" style={{ fontSize: 14, margin: 0 }}>Voucher lo berhasil diklaim. <span>{who}</span></p>
                  </div>
                  <div className="codebox">
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span className="k" style={{ fontSize: 11 }}>{rp(result.nominal)} OFF · KODE</span>
                      <span className="code">{result.code}</span>
                    </div>
                    <button type="button" className="copy" ref={doneCopyRef} onClick={copy}>{copied ? "Disalin" : "Salin kode"}</button>
                  </div>
                  <p className="help" style={{ fontSize: 13, margin: 0 }}>Berlaku sampai {fmtDate(result.expiredAt)}. Tidak berlaku untuk apparel dan clearance sale.</p>
                  <Link className="btn dark" href="/">BELANJA SEKARANG</Link>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="steps">
          <div className="wrap">
            <h2 className="display">3 steps to your reward.</h2>
            <div className="grid3">
              <div className="step"><span className="n">01</span><h3>REGISTER</h3><p>Isi nama, nomor BIB, kategori race, dan kontak sesuai data kepesertaan JRF.</p></div>
              <div className="step"><span className="n">02</span><h3>VERIFY</h3><p>Upload screenshot tiket / My Race di aplikasi JRF untuk memverifikasi data peserta.</p></div>
              <div className="step"><span className="n">03</span><h3>CLAIM &amp; SHOP</h3><p>Setelah lolos verifikasi, kode voucher muncul dan siap digunakan di sneakersflash.com.</p></div>
            </div>
          </div>
        </section>

        <section className="sk" id="sk">
          <div className="wrap">
            <div className="sk-box">
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <h2 className="display">Syarat &amp; ketentuan</h2>
                <div className="chips"><span>Klaim: 22-29 Oktober 2026</span><span>Berlaku: 14 hari sejak klaim</span><span>Website only</span></div>
              </div>
              <div className="tiers">
                {Object.entries(TIERS).map(([id, t]) => (
                  <div className="tier" key={id}><span className="k">{id}</span><b>{rp(t.nominal)}</b></div>
                ))}
              </div>
              <ol>
                <li>Promo voucher ini khusus peserta yang terdaftar pada Jakarta Running Festival 2026.</li>
                <li>Periode klaim voucher: <strong>22-29 Oktober 2026</strong>.</li>
                <li>Kode voucher berlaku selama <strong>14 hari sejak berhasil diklaim</strong>. Tanggal kedaluwarsa ditampilkan pada kode voucher.</li>
                <li>Nominal voucher mengikuti kategori peserta: 5K Rp150.000, 10K Rp250.000, HM Rp350.000, dan FM Rp500.000.</li>
                <li>Minimum pembelian <strong>Rp2.000.000</strong> untuk menggunakan voucher.</li>
                <li>Voucher tidak berlaku untuk pembelian apparel dan produk clearance sale.</li>
                <li>Voucher hanya berlaku untuk transaksi di <strong>sneakersflash.com</strong>, bukan marketplace.</li>
                <li>Satu nomor BIB hanya dapat digunakan untuk satu kali klaim voucher.</li>
                <li>Setiap kode voucher hanya dapat digunakan untuk satu transaksi dan tidak dapat ditukar dengan uang tunai.</li>
                <li>Data peserta dan screenshot kepesertaan harus sesuai dan berhasil melewati proses verifikasi.</li>
                <li>Ketentuan kombinasi voucher dengan Flash Point atau promo lain mengikuti aturan yang ditetapkan Sneakers Flash dan harus ditampilkan sebelum checkout.</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="faq">
          <div className="wrap">
            <div className="faq-box">
              <h2 className="display">FAQ</h2>
              <div>
                {FAQ.map(([q, a]) => (
                  <details key={q}>
                    <summary>
                      <span>{q}</span>
                      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}><path d="m6 9 6 6 6-6" /></svg>
                    </summary>
                    <p>{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <span className="logo" style={{ fontSize: 20 }}>SNEAKERS FLASH</span>
          <span>© 2026 Sneakers Flash. All rights reserved.</span>
        </div>
      </footer>

      {result && popup && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && closePopup()} onKeyDown={(e) => e.key === "Escape" && closePopup()}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="popupTitle">
            <div className="m-head">
              <button type="button" className="m-close" aria-label="Tutup" ref={closeRef} onClick={closePopup}>
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
              <div className="m-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/jrf/jrf-logo.png" alt="Jakarta Running Fest 2026" width={180} style={{ display: "block", height: "auto", marginBottom: 6 }} />
                <span className="k" style={{ color: "#fff", letterSpacing: ".14em" }}>JRF 2026 - {result.category} RUNNER REWARD</span>
                <h2 className="display" id="popupTitle">Your reward<br />is unlocked!</h2>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>Voucher lo berhasil diklaim. Saatnya pilih sneakers favorit lo!</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#E6EBFF" }}>{who}</p>
              </div>
            </div>
            <div className="m-card">
              <div className="m-val">
                <span className="k" style={{ fontSize: 11, letterSpacing: ".14em" }}>SNEAKERS FLASH EXCLUSIVE VOUCHER</span>
                <span className="big">{rp(result.nominal)} OFF</span>
                <span className="small">Min. belanja Rp2.000.000</span>
              </div>
              <div className="tear" aria-hidden="true"></div>
              <div className="m-code">
                <div className="r">
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                    <span className="k" style={{ fontSize: 11 }}>KODE</span>
                    <span className="code">{result.code}</span>
                  </div>
                  <button type="button" className="copy" onClick={copy}>{copied ? "Disalin" : "Salin kode"}</button>
                </div>
                <span className="msg-ok" role="status" hidden={!copied}>Kode voucher berhasil disalin!</span>
              </div>
            </div>
            <div className="m-foot">
              <p>Berlaku sampai {fmtDate(result.expiredAt)}. Tidak berlaku untuk apparel dan clearance sale.</p>
              <Link className="btn" href="/">BELANJA SEKARANG</Link>
              <button type="button" className="ghost" onClick={closePopup}>NANTI AJA</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
