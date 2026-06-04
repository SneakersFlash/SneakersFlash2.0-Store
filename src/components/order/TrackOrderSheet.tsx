"use client";

import React, { useEffect, useRef, useState } from "react";
import PageLoader from "@/components/common/PageLoader";
import {
  X, Truck, CheckCircle2, MapPin, Clock,
  AlertCircle, Package, Copy, Check,
} from "lucide-react";
import { ordersService } from "@/lib/api/orders.service";
import { getLionStatus, isLionParcelDelivered, LION_STATUS_CLASSES, LION_JOURNEY_TYPE } from "@/lib/constants/lionParcelStatus";
import type { TrackingResult, LionParcelTrackingResult } from "@/types/order.types";

// ── helpers ───────────────────────────────────────────────────────────────────

function getAwb(order: any): string {
  return (
    order?.trackingNumber ||
    order?.lionParcelSttId ||   // [BARU] field Lion Parcel
    order?.courier?.trackingNumber ||
    ""
  );
}

function getCourierCode(order: any): string {
  return (order?.courierName || order?.courier?.name || "").toLowerCase();
}

function getPhone(order: any): string {
  return order?.address?.phone || order?.user?.phone || "";
}

// LION_PARCEL disabled — backend belum siap, pakai Raja Ongkir dulu
function isLionParcelOrder(_order: any): boolean {
  return false;
  // return order?.shippingProvider === "LION_PARCEL";
}

// ── sub-component: timeline RajaOngkir (Komerce) ─────────────────────────────

function RajaOngkirTimeline({ data }: { data: TrackingResult }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.summary.waybill_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Resi info card */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">
          Nomor Resi
        </p>
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono font-bold text-gray-900 text-[15px] tracking-wider">
            {data.summary.waybill_number}
          </p>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[10px] font-semibold text-red-500 border border-red-200 bg-red-50 px-2.5 py-1 rounded-full hover:bg-orange-100 transition-colors"
          >
            {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
          </button>
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-[11px] font-medium bg-white border border-gray-200 text-gray-700 px-2.5 py-1 rounded-full">
            {data.summary.courier_name}
          </span>
          <span className="text-[11px] font-medium bg-white border border-gray-200 text-gray-700 px-2.5 py-1 rounded-full">
            {data.summary.service_code}
          </span>
          {data.delivered && (
            <span className="text-[11px] font-semibold bg-green-50 border border-green-200 text-green-700 px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 size={11} /> Terkirim
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-500">
          <MapPin size={12} className="text-gray-400 flex-shrink-0" />
          <span className="font-medium text-gray-700">{data.summary.origin}</span>
          <span className="text-gray-300">→</span>
          <span className="font-medium text-gray-700">{data.summary.destination}</span>
        </div>
      </div>

      {/* Timeline manifest */}
      {data.manifest && data.manifest.length > 0 ? (
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Riwayat Perjalanan
          </p>
          <div className="relative pl-5">
            <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gray-100 rounded-full" />
            <div className="flex flex-col gap-5">
              {data.manifest.map((item, idx) => (
                <div key={idx} className="relative flex gap-4">
                  <div className={`absolute -left-5 mt-0.5 w-[14px] h-[14px] rounded-full border-2 border-white flex-shrink-0 z-10 ${
                    idx === 0 ? "bg-[#F70000] shadow-sm shadow-red-200" : "bg-gray-300"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-semibold leading-snug ${idx === 0 ? "text-gray-900" : "text-gray-500"}`}>
                      {item.manifest_description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock size={10} className="text-gray-300 flex-shrink-0" />
                      <span className="text-[10px] text-gray-400">
                        {item.manifest_date} · {item.manifest_time}
                      </span>
                      {item.city_name && (
                        <>
                          <span className="text-gray-200">·</span>
                          <span className="text-[10px] font-medium text-gray-500">{item.city_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {data.delivery_status?.pod_receiver && (
            <div className="mt-5 pt-4 border-t border-dashed border-gray-200 text-[11px] text-gray-400">
              Diterima oleh{" "}
              <span className="font-semibold text-gray-700">{data.delivery_status.pod_receiver}</span>
              {" "}· {data.delivery_status.pod_date} {data.delivery_status.pod_time}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-400 text-sm">
          Belum ada riwayat perjalanan tersedia.
        </div>
      )}
    </div>
  );
}

// ── Lion Parcel helpers (di luar komponen) ───────────────────────────────────

function formatLionDatetime(iso: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth()+1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Extract nomor resi baru dari remarks REROUTE/RTS */
function extractNewResi(remarks: string): string | null {
  const match = remarks?.match(/RESI\s+(?:TERBARU|BARU)\s+([A-Z0-9]+)/i);
  return match?.[1] ?? null;
}

/** Label per journey type */
function getJourneyLabel(jt: string): { label: string; color: string } {
  switch (jt) {
    case 'reroute':        return { label: 'Pengiriman Ulang (Reroute)', color: 'orange' };
    case 'return':         return { label: 'Perjalanan Retur ke Pengirim', color: 'red' };
    case 'returnhq':       return { label: 'Retur ke Lion Parcel HQ', color: 'red' };
    case 'cancel':         return { label: 'Pengembalian (Cancel)', color: 'red' };
    case 'return-reroute': return { label: 'Retur + Alamat Baru', color: 'red' };
    default:               return { label: 'Perjalanan Utama', color: 'blue' };
  }
}

/** Status yang menjadi pemisah antar journey (tidak punya stt_journey_type sendiri) */
const TRANSITION_CODES = new Set(['REROUTE', 'RTS', 'RTSHQ', 'CNX', 'SCRAP']);

interface HistorySection {
  type: 'journey' | 'transition';
  journeyType?: string;
  events?: any[];
  event?: any;
}

function buildHistorySections(history: any[]): HistorySection[] {
  if (!history.length) return [];
  const sections: HistorySection[] = [];
  let currentJT: string | null = null;
  let currentEvents: any[] = [];

  const flush = () => {
    if (currentEvents.length > 0) {
      sections.push({ type: 'journey', journeyType: currentJT ?? '', events: [...currentEvents] });
      currentEvents = [];
    }
  };

  for (const ev of history) {
    const jt = ev.stt_journey_type || '';
    const isTransition = TRANSITION_CODES.has(ev.status_code) && !ev.stt_journey_type;

    if (isTransition) {
      flush();
      sections.push({ type: 'transition', event: ev });
      currentJT = null;
    } else if (jt !== currentJT) {
      flush();
      currentJT = jt;
      currentEvents.push(ev);
    } else {
      currentEvents.push(ev);
    }
  }
  flush();
  return sections;
}

// ── sub-component: timeline Lion Parcel ──────────────────────────────────────

function LionParcelTimeline({ data }: { data: any }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.stt_no);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentCfg = getLionStatus(data.current_status || '');
  const currentCls = LION_STATUS_CLASSES[currentCfg.color];

  // ── STT ADJUSTED detection ────────────────────────────────────────────────
  const history: any[] = data.history || [];
  const bkdEvent      = history.find((ev: any) => ev.status_code === 'BKD' && !ev.stt_journey_type);
  const adjustedEvent = history.find((ev: any) =>
    ev.status_code === 'STT ADJUSTED' || ev.status_code === 'STT ADJUSTED POD'
  );
  const hasTariffChange = !!(adjustedEvent && bkdEvent && adjustedEvent.total_tariff > 0);
  const originalTariff  = bkdEvent?.total_tariff ?? 0;
  const newTariff       = adjustedEvent?.total_tariff ?? 0;
  const tariffDiff      = newTariff - originalTariff;
  const bookedWeightKg  = adjustedEvent?.request_gross_weight_kg;
  const actualWeightKg  = adjustedEvent?.chargeable_weight;
  const grossWeightKg   = adjustedEvent?.total_gross_weight;
  const volumeWeightKg  = adjustedEvent?.total_volume_weight;
  const adjustmentPhotos: string[] = adjustedEvent?.attachment?.filter(Boolean) ?? [];

  const fmtPrice = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  // ── Build sections ────────────────────────────────────────────────────────
  const sections = buildHistorySections(history);

  // ── Event renderer ────────────────────────────────────────────────────────
  const renderEvent = (ev: any, idx: number, isFirst: boolean) => {
    const cfg = getLionStatus(ev.status_code || ev.current_status);
    const cls = LION_STATUS_CLASSES[cfg.color];
    const isAdjusted = ev.status_code === 'STT ADJUSTED' || ev.status_code === 'STT ADJUSTED POD';
    const isPOD      = ev.status_code === 'POD';
    const isDEL      = ev.status_code === 'DEL';
    const podPhotos: string[] = isPOD ? (ev.attachment?.filter(Boolean) ?? []) : [];
    const receivedBy = isPOD ? (ev.received_by || ev.proof?.name) : null;

    return (
      <div key={idx} className="relative flex gap-4">
        <div className={`absolute -left-5 mt-0.5 w-[14px] h-[14px] rounded-full border-2 border-white flex-shrink-0 z-10 ${isFirst ? cls.dot : 'bg-gray-300'}`} />
        <div className="flex-1 min-w-0">
          {/* Status badge + journey type */}
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${isFirst ? cls.badge : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
              {ev.status_code}
            </span>
            <span className={`text-[12px] font-semibold ${isFirst ? 'text-gray-900' : 'text-gray-500'}`}>
              {cfg.label}
            </span>
            {ev.stt_journey_type && LION_JOURNEY_TYPE[ev.stt_journey_type] && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${isFirst ? LION_STATUS_CLASSES[LION_JOURNEY_TYPE[ev.stt_journey_type].color].badge : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                {LION_JOURNEY_TYPE[ev.stt_journey_type].label}
              </span>
            )}
          </div>

          {/* Remarks */}
          <p className={`text-[11px] leading-relaxed ${isFirst ? 'text-gray-600' : 'text-gray-400'}`}>
            {ev.remarks}
          </p>

          {/* Extra: DEL courier name */}
          {(isDEL || isPOD) && ev.courier_name && (
            <p className="text-[10px] text-gray-500 mt-0.5">
              Kurir: <span className="font-medium">{ev.courier_name}</span>
            </p>
          )}

          {/* Extra: POD diterima oleh */}
          {isPOD && receivedBy && (
            <p className={`text-[10px] mt-0.5 ${isFirst ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
              Diterima oleh: <span className="font-semibold">{receivedBy}</span>
            </p>
          )}

          {/* Extra: POD proof photos */}
          {isPOD && podPhotos.length > 0 && (
            <div className="flex gap-2 mt-1.5 flex-wrap">
              {podPhotos.map((url: string, i: number) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                  <img src={url} alt={`Bukti ${i+1}`}
                    className="w-14 h-14 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </a>
              ))}
            </div>
          )}

          {/* Extra: STT ADJUSTED ringkasan */}
          {isAdjusted && ev.total_tariff > 0 && (
            <div className="mt-1 text-[10px] text-amber-600 flex flex-wrap gap-x-3">
              <span>Tarif baru: <strong>{fmtPrice(ev.total_tariff)}</strong></span>
              {ev.chargeable_weight && <span>Berat: <strong>{ev.chargeable_weight} kg</strong></span>}
              {ev.total_volume_weight && <span>Volume: <strong>{ev.total_volume_weight} kg</strong></span>}
            </div>
          )}

          {/* Waktu & kota */}
          <div className="flex items-center gap-1.5 mt-1">
            <Clock size={10} className="text-gray-300 flex-shrink-0" />
            <span className="text-[10px] text-gray-400">{formatLionDatetime(ev.datetime)}</span>
            {ev.city && (
              <>
                <span className="text-gray-200">·</span>
                <span className="text-[10px] font-medium text-gray-500">{ev.city}</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ── Info card ───────────────────────────────────────────────────── */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">
          Nomor Resi · Lion Parcel
        </p>
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono font-bold text-gray-900 text-[15px] tracking-wider">{data.stt_no}</p>
          <button onClick={handleCopy}
            className="flex items-center gap-1.5 text-[10px] font-semibold text-orange-500 border border-orange-200 bg-orange-50 px-2.5 py-1 rounded-full hover:bg-orange-100 transition-colors">
            {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
          </button>
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-[11px] font-medium bg-white border border-gray-200 text-gray-700 px-2.5 py-1 rounded-full">Lion Parcel</span>
          {data.product_type && (
            <span className="text-[11px] font-medium bg-white border border-gray-200 text-gray-700 px-2.5 py-1 rounded-full">{data.product_type}</span>
          )}
          {data.current_status && (
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${currentCls.badge}`}>
              {isLionParcelDelivered(data.current_status) && <CheckCircle2 size={11} />}
              {currentCfg.label}
            </span>
          )}
          {(() => {
            const jt = history[0]?.stt_journey_type;
            const jtCfg = jt ? LION_JOURNEY_TYPE[jt] : null;
            if (!jtCfg) return null;
            return (
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${LION_STATUS_CLASSES[jtCfg.color].badge}`}>
                {jtCfg.label}
              </span>
            );
          })()}
        </div>

        {(data.origin || data.destination) && (
          <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-500">
            <MapPin size={12} className="text-gray-400 flex-shrink-0" />
            <span className="font-medium text-gray-700">{data.origin}</span>
            <span className="text-gray-300">→</span>
            <span className="font-medium text-gray-700">{data.destination}</span>
          </div>
        )}

        {/* STT ADJUSTED card */}
        {hasTariffChange && (
          <div className="mt-3 pt-3 border-t border-dashed border-amber-200 -mx-4 -mb-4 px-4 pb-4 rounded-b-2xl bg-amber-50">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">⚠ Tarif & Berat Disesuaikan</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-[11px] text-gray-400 line-through">{fmtPrice(originalTariff)}</span>
              <span className="text-gray-300">→</span>
              <span className="text-[14px] font-bold text-amber-700">{fmtPrice(newTariff)}</span>
              {tariffDiff !== 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${tariffDiff > 0 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                  {tariffDiff > 0 ? '+' : ''}{fmtPrice(tariffDiff)}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px]">
              {bookedWeightKg != null && <><span className="text-gray-400">Berat booking</span><span className="font-medium text-gray-600">{bookedWeightKg} kg</span></>}
              {actualWeightKg != null && (
                <><span className="text-gray-400">Berat aktual</span>
                <span className={`font-bold ${bookedWeightKg != null && actualWeightKg > bookedWeightKg ? 'text-red-600' : 'text-gray-700'}`}>{actualWeightKg} kg</span></>
              )}
              {grossWeightKg != null && <><span className="text-gray-400">Gross weight</span><span className="font-medium text-gray-600">{grossWeightKg} kg</span></>}
              {volumeWeightKg != null && <><span className="text-gray-400">Volume weight</span><span className="font-medium text-gray-600">{volumeWeightKg} kg</span></>}
            </div>
            {adjustmentPhotos.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {adjustmentPhotos.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt={`Bukti ${i+1}`}
                      className="w-14 h-14 object-cover rounded-lg border border-amber-200 hover:opacity-80 transition-opacity"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── History sections ─────────────────────────────────────────────── */}
      {sections.length > 0 ? (
        <div className="flex flex-col gap-5">
          {sections.map((section, si) => {
            // ── Transition divider (REROUTE / RTS / dll) ─────────────────
            if (section.type === 'transition') {
              const ev = section.event!;
              const cfg = getLionStatus(ev.status_code);
              const cls = LION_STATUS_CLASSES[cfg.color];
              const newResi = extractNewResi(ev.remarks || '');
              return (
                <div key={si} className={`rounded-xl px-4 py-3 border ${cls.badge} flex flex-col gap-1`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${cls.badge}`}>{ev.status_code}</span>
                    <span className="text-[12px] font-bold">{cfg.label}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{ev.remarks}</p>
                  {newResi && (
                    <p className="text-[11px] font-semibold mt-0.5">
                      Nomor resi baru: <span className="font-mono">{newResi}</span>
                    </p>
                  )}
                  <span className="text-[10px] opacity-70">{formatLionDatetime(ev.datetime)} · {ev.city}</span>
                </div>
              );
            }

            // ── Journey section ───────────────────────────────────────────
            const events = section.events!;
            const jt     = section.journeyType!;
            const jInfo  = getJourneyLabel(jt);
            const sectionClsMap: Record<string, string> = {
              blue: 'text-blue-600 bg-blue-50 border-blue-200',
              orange: 'text-orange-600 bg-orange-50 border-orange-200',
              red: 'text-red-600 bg-red-50 border-red-200',
            };
            const sectionCls = sectionClsMap[jInfo.color] || sectionClsMap.blue;

            return (
              <div key={si}>
                {/* Section header — hanya tampil kalau ada journey type */}
                {jt && (
                  <div className={`flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest ${sectionCls}`}>
                    {jInfo.label}
                  </div>
                )}

                {!jt && si > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest whitespace-nowrap">Perjalanan Awal</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                )}

                <div className="relative pl-5">
                  <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gray-100 rounded-full" />
                  <div className="flex flex-col gap-5">
                    {events.map((ev, idx) => renderEvent(ev, idx, idx === 0 && si === 0))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-400 text-sm">
          Belum ada riwayat perjalanan tersedia.
        </div>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

interface TrackOrderSheetProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function TrackOrderSheet({ order, isOpen, onClose }: TrackOrderSheetProps) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error" | "no_awb">("idle");
  const [trackingData, setTrackingData] = useState<TrackingResult | LionParcelTrackingResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !order) return;

    const awb    = getAwb(order);
    const courier = getCourierCode(order);

    if (!awb) {
      setState("no_awb");
      return;
    }

    const phone = getPhone(order);

    setState("loading");
    setTrackingData(null);
    setErrorMsg("");

    // [DIUBAH] Pakai trackAny() agar otomatis routing ke provider yang benar
    ordersService
      .trackAny({
        awb,
        courier,
        shippingProvider: order?.shippingProvider ?? null,
        lastPhone: phone || undefined,
      })
      .then((result) => {
        setTrackingData(result);
        setState("success");
      })
      .catch((err) => {
        setErrorMsg(
          err?.response?.data?.message ||
          "Gagal memuat status pengiriman. Coba lagi nanti."
        );
        setState("error");
      });
  }, [isOpen, order]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleRetry = () => {
    setState("idle");
    setTimeout(() => setState("loading"), 50);
  };

  if (!isOpen) return null;

  const awb = getAwb(order);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        ref={sheetRef}
        className="relative w-full max-w-lg bg-white rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-0 md:fade-in duration-300 max-h-[90vh]"
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAEBE0] flex items-center justify-center">
              <Truck size={18} className="text-[#F70000]" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-gray-900">Track My Order</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {order?.courierName} {order?.courierService}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto flex-1 px-5 py-5">

          {state === "loading" && (
            <div className="flex items-center justify-center py-16">
              <PageLoader />
            </div>
          )}

          {state === "no_awb" && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Package size={40} className="text-gray-200" />
              <p className="text-sm font-semibold text-gray-700">Nomor resi belum tersedia</p>
              <p className="text-xs text-gray-400 max-w-[240px]">
                Penjual sedang memproses pengiriman. Cek kembali beberapa saat lagi.
              </p>
            </div>
          )}

          {state === "error" && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <AlertCircle size={36} className="text-red-400" />
              <p className="text-sm font-semibold text-gray-700">Gagal Memuat Tracking</p>
              <p className="text-xs text-gray-400 max-w-[260px]">{errorMsg}</p>
              {awb && (
                <p className="text-[11px] text-gray-400 mt-1">
                  Resi: <span className="font-mono font-semibold text-gray-700">{awb}</span>
                </p>
              )}
              <button onClick={handleRetry} className="mt-2 text-[#F70000] font-bold text-sm hover:underline">
                Coba Lagi
              </button>
            </div>
          )}

          {/* [DIUBAH] Render timeline berdasarkan provider */}
          {state === "success" && trackingData && (
            isLionParcelOrder(order)
              ? <LionParcelTimeline data={trackingData as LionParcelTrackingResult} />
              : <RajaOngkirTimeline data={trackingData as TrackingResult} />
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-6 pt-3 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 text-gray-700 font-bold text-[13px] rounded-2xl hover:bg-gray-200 transition-colors active:scale-[0.98]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}