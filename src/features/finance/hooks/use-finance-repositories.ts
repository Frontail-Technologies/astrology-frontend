"use client";

import { useCallback } from "react";
import { useMockRepository } from "@/features/admin/hooks/use-mock-repository";
import { chatSessionSeed, earningSeed, payoutSeed, walletSeed } from "../data/finance";
import type { ChatSession, Earning, Payout, PayoutStatus, Wallet } from "../types/finance";

export function usePayoutRepository() {
  const store = useMockRepository<Payout>("astrology-admin-payouts-v1", payoutSeed);
  const setStatus = useCallback((id: string, status: PayoutStatus, extra: { reference?: string; note?: string } = {}) => {
    const payout = store.getById(id);
    if (!payout) throw new Error("Payout not found");
    store.update({ ...payout, ...extra, status, updatedAt: new Date().toISOString() });
  }, [store]);
  const createPayout = useCallback((input: Omit<Payout, "id" | "status" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const payout: Payout = { ...input, id: `pout_${Date.now().toString().slice(-6)}`, status: "pending", createdAt: now, updatedAt: now };
    store.create(payout);
    return payout;
  }, [store]);
  return { ...store, setStatus, createPayout };
}

export function useEarningRepository() {
  return useMockRepository<Earning>("astrology-admin-earnings-v1", earningSeed);
}

export function useWalletRepository() {
  return useMockRepository<Wallet>("astrology-admin-wallets-v1", walletSeed);
}

export function useChatSessionRepository() {
  return useMockRepository<ChatSession>("astrology-admin-chat-sessions-v1", chatSessionSeed);
}
