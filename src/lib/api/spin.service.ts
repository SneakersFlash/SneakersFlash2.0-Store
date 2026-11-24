/**
 * API spin ONE MORE THING (HANDOFF §3.2) — backend: src/modules/spin.
 *
 * Backend sekarang MODE TESTING: reward dipilih server tapi tidak disimpan
 * dan Flash Point tidak dikreditkan. Responsnya membawa `testMode: true`.
 */
import apiClient from "./client";
import type { RewardKey, RewardType } from "@/lib/campaign/one-more-thing";

export type ActivateError = "CODE_INVALID" | "CODE_USED" | "UNKNOWN";

export interface PlayResult {
  rewardKey: RewardKey;
  type: RewardType;
  pointValue: number | null;
  label: string;
  slotIndex: number;
  testMode?: boolean;
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

export async function getCampaign(): Promise<{
  active: boolean;
  testMode: boolean;
} | null> {
  try {
    const { data } = await apiClient.get("/spin/campaign/one-more-thing");
    return data;
  } catch {
    return null;
  }
}

export async function activateCode(raw: string) {
  const code = raw.trim().toUpperCase();
  try {
    const { data } = await apiClient.post("/spin/codes/activate", { code });
    return data as { code: string; status: "RESERVED" };
  } catch (e) {
    throw toError(e);
  }
}

export async function playSpin(code: string): Promise<PlayResult> {
  try {
    const { data } = await apiClient.post("/spin/play", { code });
    return data as PlayResult;
  } catch (e) {
    throw toError(e);
  }
}
