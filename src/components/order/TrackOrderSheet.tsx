"use client";

// components/product/TrackOrderSheet.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  X,
  Truck,
  CheckCircle2,
  MapPin,
  Clock,
  AlertCircle,
  Package,
  Copy,
  Check,
} from "lucide-react";
import { ordersService } from "@/lib/api/orders.service";
import { TrackingResult } from "@/types/order.types";

// ── helpers ───────────────────────────────────────────────────────────────────
function getAwb(order: any): string {
  return (
    order?.awb ||
    order?.awbTrackingNumber ||
    order?.trackingNumber ||
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

// ── sub-component: timeline ───────────────────────────────────────────────────
function TrackingTimeline({ data }: { data: TrackingResult }) {
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
            className="flex items-center gap-1.5 text-[10px] font-semibold text-orange-500 border border-orange-200 bg-orange-50 px-2.5 py-1 rounded-full hover:bg-orange-100 transition-colors"
          >
            {copied ? (
              <>
                <Check size={11} /> Copied
              </>
            ) : (
              <>
                <Copy size={11} /> Copy
              </>
            )}
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

        {/* Origin → Destination */}
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
            {/* vertical line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gray-100 rounded-full" />

            <div className="flex flex-col gap-5">
              {data.manifest.map((item, idx) => (
                <div key={idx} className="relative flex gap-4">
                  {/* dot */}
                  <div
                    className={`absolute -left-5 mt-0.5 w-[14px] h-[14px] rounded-full border-2 border-white flex-shrink-0 z-10 ${
                      idx === 0
                        ? "bg-[#F70000] shadow-sm shadow-red-200"
                        : "bg-gray-300"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[13px] font-semibold leading-snug ${
                        idx === 0 ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
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
                          <span className="text-[10px] font-medium text-gray-500">
                            {item.city_name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* POD footer */}
          {data.delivery_status?.pod_receiver && (
            <div className="mt-5 pt-4 border-t border-dashed border-gray-200 text-[11px] text-gray-400">
              Diterima oleh{" "}
              <span className="font-semibold text-gray-700">
                {data.delivery_status.pod_receiver}
              </span>{" "}
              · {data.delivery_status.pod_date} {data.delivery_status.pod_time}
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

// ── main component ────────────────────────────────────────────────────────────
interface TrackOrderSheetProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function TrackOrderSheet({
  order,
  isOpen,
  onClose,
}: TrackOrderSheetProps) {
  const [state, setState] = useState<
    "idle" | "loading" | "success" | "error" | "no_awb"
  >("idle");
  const [trackingData, setTrackingData] = useState<TrackingResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const sheetRef = useRef<HTMLDivElement>(null);

  // Auto-fetch when sheet opens
  useEffect(() => {
    if (!isOpen || !order) return;

    const awb = getAwb(order);
    const courier = getCourierCode(order);

    if (!awb || !courier) {
      setState("no_awb");
      return;
    }

    const phone = getPhone(order);

    setState("loading");
    setTrackingData(null);
    setErrorMsg("");

    ordersService
      .trackShipment(awb, courier, phone || undefined)
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

  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  const awb = getAwb(order);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Sheet */}
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
          {/* LOADING */}
          {state === "loading" && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-10 h-10 border-4 border-gray-100 border-t-[#F70000] rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Memuat status pengiriman…</p>
            </div>
          )}

          {/* NO AWB */}
          {state === "no_awb" && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Package size={40} className="text-gray-200" />
              <p className="text-sm font-semibold text-gray-700">
                Nomor resi belum tersedia
              </p>
              <p className="text-xs text-gray-400 max-w-[240px]">
                Penjual sedang memproses pengiriman. Cek kembali beberapa saat lagi.
              </p>
            </div>
          )}

          {/* ERROR */}
          {state === "error" && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <AlertCircle size={36} className="text-red-400" />
              <p className="text-sm font-semibold text-gray-700">
                Gagal Memuat Tracking
              </p>
              <p className="text-xs text-gray-400 max-w-[260px]">{errorMsg}</p>
              {awb && (
                <p className="text-[11px] text-gray-400 mt-1">
                  Resi:{" "}
                  <span className="font-mono font-semibold text-gray-700">
                    {awb}
                  </span>
                </p>
              )}
              <button
                onClick={() => {
                  setState("idle");
                  setTimeout(() => setState("loading"), 50); // trigger re-fetch
                }}
                className="mt-2 text-[#F70000] font-bold text-sm hover:underline"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* SUCCESS */}
          {state === "success" && trackingData && (
            <TrackingTimeline data={trackingData} />
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