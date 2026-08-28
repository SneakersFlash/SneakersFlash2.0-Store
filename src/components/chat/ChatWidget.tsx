"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Zap,
  PhoneCall,
  RefreshCw,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { chatService } from "@/lib/api/chat.service";
import type { ChatMessage } from "@/lib/api/chat.service";

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_KEY = "sf_chat_session_id";
const VISITOR_KEY = "sf_chat_visitor_id";
// Bubble disembunyikan user — disimpan biar nggak nongol lagi tiap pindah halaman
const HIDDEN_KEY = "sf_chat_hidden";

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = `visitor_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-zinc-400"
          animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function Bubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-zinc-900 text-white rounded-br-[4px]"
            : "bg-zinc-100 text-zinc-700 rounded-bl-[4px]"
        )}
      >
        {msg.content}
      </div>
    </motion.div>
  );
}

// ─── Handoff banner ───────────────────────────────────────────────────────────

function HandoffBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-3 mb-3 rounded-xl border border-amber-100 bg-amber-50/80 p-3 text-xs text-amber-800"
    >
      <div className="flex items-start gap-2">
        <PhoneCall className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
        <div>
          <p className="font-semibold">Diteruskan ke tim CS</p>
          <p className="mt-0.5 text-amber-600/80">
            Tim kami akan segera membantu. Atau langsung chat via{" "}
            <a
              href="https://wa.me/6281313911391"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-700"
            >
              WhatsApp
            </a>
            .
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main widget ──────────────────────────────────────────────────────────────

export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSlow, setLoadingSlow] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ─── Restore preferensi sembunyi ────────────────────────────────────────────
  // Dibaca di effect (bukan useState initializer) supaya markup SSR & klien sama
  useEffect(() => {
    if (localStorage.getItem(HIDDEN_KEY) === "1") setHidden(true);
  }, []);

  // ─── Restore session from localStorage ──────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      setSessionId(saved);
      chatService
        .getHistory(saved)
        .then((history) => {
          if (history.length > 0) setMessages(history);
        })
        .catch(() => {
          localStorage.removeItem(SESSION_KEY);
          setSessionId(null);
        });
    }
  }, []);

  // ─── Scroll to bottom on new messages ───────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ─── Focus input when panel opens ───────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  // ─── Create session lazily on first message ──────────────────────────────────
  const ensureSession = useCallback(async (): Promise<string> => {
    if (sessionId) return sessionId;

    const visitorId = getOrCreateVisitorId();
    const newSessionId = await chatService.createSession({
      visitorId,
      pageUrl: window.location.href,
      productSlug: extractProductSlug(pathname),
    });

    localStorage.setItem(SESSION_KEY, newSessionId);
    setSessionId(newSessionId);
    return newSessionId;
  }, [sessionId, pathname]);

  // ─── Send message ────────────────────────────────────────────────────────────
  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setLoadingSlow(false);
    const slowTimer = setTimeout(() => setLoadingSlow(true), 6000);

    try {
      const sid = await ensureSession();
      const res = await chatService.sendMessage({
        sessionId: sid,
        message: text,
        pageUrl: window.location.href,
        productSlug: extractProductSlug(pathname),
      });

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: res.reply,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMsg]);
      if (res.handoff) setHandoff(true);
      if (!open) setUnread((n) => n + 1);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          content:
            "Maaf kak, ada gangguan koneksi. Coba lagi ya, atau hubungi tim CS via WhatsApp.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
      setLoadingSlow(false);
    }
  }, [input, loading, ensureSession, open, pathname]);

  // ─── Reset session ────────────────────────────────────────────────────────────
  const resetSession = () => {
    localStorage.removeItem(SESSION_KEY);
    setSessionId(null);
    setMessages([]);
    setHandoff(false);
    setInput("");
  };

  // ─── Sembunyikan / munculkan bubble ─────────────────────────────────────────
  const hideWidget = () => {
    setOpen(false);
    setHidden(true);
    localStorage.setItem(HIDDEN_KEY, "1");
  };

  const showWidget = () => {
    setHidden(false);
    localStorage.removeItem(HIDDEN_KEY);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // Halaman /links sudah memajang tombol WhatsApp sebagai salah satu tautan
  // utamanya. Bubble chat di atasnya hanya menutupi konten dan menawarkan jalur
  // yang sama dua kali.
  if (pathname === "/links") return null;

  return (
    <>
      {/* ── Chat panel ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && !hidden && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="fixed bottom-[150px] lg:bottom-[88px] right-5 z-50 flex w-[360px] max-w-[calc(100vw-20px)] flex-col rounded-2xl bg-white shadow-[0_8px_40px_-8px_rgba(0,0,0,0.18)] overflow-hidden"
            style={{ height: "520px" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-zinc-950 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.08]">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white tracking-tight leading-tight">
                    Sneakers Flash
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <p className="text-[11px] text-zinc-400 leading-tight">
                      Online · Balas dalam 1 menit
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={resetSession}
                  title="Reset chat"
                  className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5 scroll-smooth">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center justify-center h-full gap-3 text-center"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100">
                    <MessageCircle className="h-6 w-6 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-800">
                      Ada yang bisa dibantu?
                    </p>
                    <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                      Tanya soal produk, stok, promo, atau pesananmu.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                    {["Cek stok 👟", "Promo aktif 🔖", "Status pesanan 📦"].map(
                      (q) => (
                        <button
                          key={q}
                          onClick={() => {
                            setInput(q.replace(/ .+/, "").trim());
                            inputRef.current?.focus();
                          }}
                          className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 active:scale-95 transition-all"
                        >
                          {q}
                        </button>
                      )
                    )}
                  </div>
                </motion.div>
              )}

              {messages.map((msg) => (
                <Bubble key={msg.id} msg={msg} />
              ))}

              {loading && (
                <div className="flex flex-col items-start gap-1">
                  <div className="bg-zinc-100 rounded-2xl rounded-bl-[4px]">
                    <TypingDots />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Handoff banner */}
            {handoff && <HandoffBanner />}

            {/* Input */}
            <div className="px-3 pb-3 pt-2.5">
              <div className="flex items-center gap-2 rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2 focus-within:border-zinc-400 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(0,0,0,0.06)] transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={
                    handoff ? "Chat diteruskan ke CS…" : "Tulis pesan…"
                  }
                  disabled={loading}
                  className="flex-1 bg-transparent text-sm text-zinc-800 placeholder:text-zinc-400 disabled:opacity-50 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || loading}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white disabled:opacity-30 hover:bg-zinc-700 active:scale-95 transition-all"
                >
                  {loading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-zinc-300 tracking-wide">
                Sneakers Flash Customer Service
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating button ─────────────────────────────────────────────────── */}
      {!hidden && (
        <div className="fixed bottom-[80px] lg:bottom-5 right-5 z-50 h-14 w-14">
          <motion.button
            onClick={() => setOpen((v) => !v)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-950 text-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)] hover:bg-zinc-800 transition-colors"
            aria-label={open ? "Tutup chat" : "Buka chat"}
          >
            <AnimatePresence mode="wait">
              {open ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="h-5 w-5" />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <MessageCircle className="h-5 w-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Unread badge */}
          <AnimatePresence>
            {unread > 0 && !open && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="pointer-events-none absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
              >
                {unread}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Sembunyikan bubble — tombol terpisah biar nggak nested di dalam button */}
          <AnimatePresence>
            {!open && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={hideWidget}
                title="Sembunyikan chat"
                aria-label="Sembunyikan chat"
                className="absolute -top-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm hover:bg-zinc-100 hover:text-zinc-700 active:scale-90 transition-all"
              >
                <X className="h-3 w-3" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Tab pemunculkan kembali ─────────────────────────────────────────── */}
      <AnimatePresence>
        {hidden && (
          <motion.button
            key="chat-reopen-tab"
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            onClick={showWidget}
            title="Tampilkan chat"
            aria-label="Tampilkan chat"
            className="fixed bottom-[92px] lg:bottom-8 right-0 z-50 flex h-12 w-7 items-center justify-center rounded-l-xl bg-zinc-950/85 text-white shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] hover:w-9 hover:bg-zinc-900 transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute top-1 left-1 h-2 w-2 rounded-full bg-red-500" />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function extractProductSlug(pathname: string): string | undefined {
  const match = pathname.match(/\/products\/([^/?#]+)/);
  return match?.[1];
}