"use client";

import { useMockRepository } from "@/features/admin/hooks/use-mock-repository";
import { consultations as seedConsultations } from "../data/consultations";
import type { Consultation } from "../types/consultation";

const STORE_KEY = "astrology-admin-consultations-v1";

export function useConsultationRepository() {
  return useMockRepository<Consultation>(STORE_KEY, seedConsultations);
}
