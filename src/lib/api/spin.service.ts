/**
 * API spin ONE MORE THING (HANDOFF §3.2).
 *
 * BACKEND BELUM ADA. Selama `USE_MOCK` true, semua fungsi di sini dijawab
 * tiruan di browser supaya UI bisa dikerjakan & dites duluan. Tiruannya
 * meniru kontrak server (404 CODE_INVALID, 409 CODE_USED, slotIndex dari
 * "server") — begitu endpoint asli jadi, cukup matikan USE_MOCK.
 *
 * JANGAN deploy ke produksi dengan USE_MOCK = true: reward tiruan dipilih
 * acak di browser dan tidak tercatat ke mana-mana.
 */
import apiClient from "./client";
import {
  OMT_SLOT_MAP,
  OMT_REWARDS,
  type RewardKey,
  type RewardType,
} from "@/lib/campaign/one-more-thing";

export const USE_MOCK = true;

export type ActivateError = "CODE_INVALID" | "CODE_USED" | "UNKNOWN";

export interface PlayResult {
  rewardKey: RewardKey;
  type: RewardType;
  pointValue: number | null;
  label: string;
  slotIndex: number;
}

export class SpinApiError extends Error {
  constructor(public code: ActivateError) {
    super(code);
  }
}

function toError(err: any): SpinApiError {
  const code = err?.response?.data?.error;
  if (code === "CODE_INVALID" || code === "CODE_USED")
    return new SpinApiError(code);
  return new SpinApiError("UNKNOWN");
}

// ── Tiruan ───────────────────────────────────────────────────────────────────
const MOCK_USED_KEY = "omt-mock-used";
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const mockUsed = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(MOCK_USED_KEY) || "[]");
  } catch {
    return [];
  }
};

async function mockActivate(code: string) {
  await wait(500);
  // Alfabet kode asli: tanpa 0/O/1/I, 8 karakter (HANDOFF §3.1).
  if (!/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/.test(code))
    throw new SpinApiError("CODE_INVALID");
  if (mockUsed().includes(code)) throw new SpinApiError("CODE_USED");
  return { code, status: "RESERVED" as const };
}

async function mockPlay(code: string): Promise<PlayResult> {
  await wait(700);
  const slotIndex = Math.floor(Math.random() * OMT_SLOT_MAP.length);
  const rewardKey = OMT_SLOT_MAP[slotIndex];
  const r = OMT_REWARDS[rewardKey];
  localStorage.setItem(MOCK_USED_KEY, JSON.stringify([...mockUsed(), code]));
  return {
    rewardKey,
    type: r.type,
    pointValue:
      r.type === "FLASH_POINT" ? Number(r.value!.replace(/\D/g, "")) : null,
    label: `${r.top} ${r.cap}`,
    slotIndex,
  };
}

// ── Publik ───────────────────────────────────────────────────────────────────
export async function activateCode(raw: string) {
  const code = raw.trim().toUpperCase();
  if (USE_MOCK) return mockActivate(code);
  try {
    const { data } = await apiClient.post("/spin/codes/activate", { code });
    return data as { code: string; status: "RESERVED" };
  } catch (e) {
    throw toError(e);
  }
}

export async function playSpin(code: string): Promise<PlayResult> {
  if (USE_MOCK) return mockPlay(code);
  try {
    const { data } = await apiClient.post("/spin/play", { code });
    return data as PlayResult;
  } catch (e) {
    throw toError(e);
  }
}
