"use client";
import { useMockRepository } from "@/features/admin/hooks/use-mock-repository";
import { orderSeed } from "../data/orders";
import type { StoreOrder } from "../types/order";
export function useOrderRepository() { return useMockRepository<StoreOrder>("astrology-admin-orders-v1", orderSeed); }
