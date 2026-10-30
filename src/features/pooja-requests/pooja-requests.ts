"use client";

import { useCallback } from "react";
import { useMockRepository } from "@/features/admin/hooks/use-mock-repository";

export type PoojaRequestStatus = "requested" | "confirmed" | "scheduled" | "completed" | "cancelled";

export type PoojaRequest = {
  id: string;
  poojaSlug: string;
  poojaTitle: string;
  customerId: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  requestedDate?: string;
  scheduledAt?: string;
  amountInPaise: number;
  status: PoojaRequestStatus;
  notes?: string;
  createdAt: string;
};

export const poojaRequestSeed: PoojaRequest[] = [
  { id: "pr-3012", poojaSlug: "ganesh-pooja", poojaTitle: "Ganesh Pooja", customerId: "cust-kavya-nair", customerName: "Kavya Nair", phone: "+91 90040 66218", email: "kavya.nair@example.com", address: "14 Lake View Road, Kochi, Kerala 682016", requestedDate: "2026-10-24", amountInPaise: 249900, status: "requested", notes: "Prefer morning muhurat.", createdAt: "2026-10-18T07:30:00Z" },
  { id: "pr-3011", poojaSlug: "rudrabhishek", poojaTitle: "Rudrabhishek", customerId: "cust-sunita-gupta", customerName: "Sunita Gupta", phone: "+91 98730 11542", address: "B-22 Sector 15, Noida, Uttar Pradesh 201301", requestedDate: "2026-10-27", amountInPaise: 329900, status: "confirmed", createdAt: "2026-10-17T10:15:00Z" },
  { id: "pr-3010", poojaSlug: "satyanarayan-pooja", poojaTitle: "Satyanarayan Pooja", customerId: "cust-arjun-pillai", customerName: "Arjun Pillai", phone: "+91 99400 77120", email: "arjun.p@example.com", address: "7 Temple Street, Chennai, Tamil Nadu 600004", requestedDate: "2026-10-21", scheduledAt: "2026-10-21T05:30:00Z", amountInPaise: 189900, status: "scheduled", createdAt: "2026-10-14T16:45:00Z" },
  { id: "pr-3009", poojaSlug: "ganesh-pooja", poojaTitle: "Ganesh Pooja", customerId: "cust-rahul-shah", customerName: "Rahul Shah", phone: "+91 98250 33018", address: "Flat 402, Shanti Residency, Ahmedabad, Gujarat 380015", scheduledAt: "2026-10-09T04:30:00Z", amountInPaise: 159900, status: "completed", createdAt: "2026-10-02T09:00:00Z" },
  { id: "pr-3008", poojaSlug: "navagraha-shanti", poojaTitle: "Navagraha Shanti", customerId: "cust-meena-joshi", customerName: "Meena Joshi", phone: "+91 98220 90231", address: "21 FC Road, Pune, Maharashtra 411004", requestedDate: "2026-10-05", amountInPaise: 299900, status: "cancelled", notes: "Customer travelling; asked to cancel.", createdAt: "2026-09-29T12:20:00Z" },
];

export function usePoojaRequestRepository() {
  const store = useMockRepository<PoojaRequest>("astrology-admin-pooja-requests-v1", poojaRequestSeed);
  const setStatus = useCallback((id: string, status: PoojaRequestStatus) => {
    const request = store.getById(id);
    if (!request) throw new Error("Request not found");
    store.update({ ...request, status });
  }, [store]);
  const schedule = useCallback((id: string, scheduledAt: string) => {
    const request = store.getById(id);
    if (!request) throw new Error("Request not found");
    store.update({ ...request, scheduledAt, status: "scheduled" });
  }, [store]);
  return { ...store, setStatus, schedule };
}
