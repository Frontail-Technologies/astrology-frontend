"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettingsRepository } from "@/features/settings/hooks/use-settings-repository";
import type { AdminSettings, SettingsSection } from "@/features/settings/types/settings";

const sections: Array<{ value: SettingsSection; label: string }> = [{ value: "general", label: "General" }, { value: "consultations", label: "Consultations" }, { value: "store", label: "Store" }, { value: "payments", label: "Payments" }, { value: "notifications", label: "Notifications" }, { value: "integrations", label: "Integrations" }];
const labels: Record<string, string> = { platformName: "Platform Name", supportEmail: "Support Email", supportPhone: "Support Phone", timezone: "Timezone", currency: "Default Currency", chatEnabled: "Chat Enabled", voiceEnabled: "Voice Enabled", videoEnabled: "Video Enabled", defaultDuration: "Default Duration", bookingNoticeHours: "Minimum Booking Notice", cancellationHours: "Cancellation Window", allowRescheduling: "Allow Rescheduling", maxReschedules: "Maximum Reschedules", enabled: "Store Enabled", trackInventory: "Track Inventory by Default", lowStockThreshold: "Low Stock Threshold", allowOutOfStockPurchase: "Allow Out-of-stock Purchase", provider: "Payment Gateway", upiEnabled: "UPI Enabled", cardsEnabled: "Cards Enabled", netBankingEnabled: "Net Banking Enabled", autoRefundOnCancellation: "Auto-refund on Cancellation", emailEnabled: "Email Enabled", smsEnabled: "SMS Enabled", whatsappEnabled: "WhatsApp Enabled", pushEnabled: "Push Enabled", bookingConfirmation: "Booking Confirmation", paymentSuccess: "Payment Success", orderUpdates: "Order Updates" };

export function AdminSettingsView() {
  const { settings, ready, updateSection } = useSettingsRepository();
  const [section, setSection] = useState<SettingsSection>("general");
  const [draft, setDraft] = useState<AdminSettings | null>(null);
  useEffect(() => { if (ready) setDraft(structuredClone(settings)); }, [ready, settings]);
  if (!draft) return <div className="min-h-40" />;
  const current = draft[section] as Record<string, unknown>;
  const set = (key: string, value: unknown) => setDraft({ ...draft, [section]: { ...current, [key]: value } } as AdminSettings);
  const dirty = JSON.stringify(draft[section]) !== JSON.stringify(settings[section]);
  const save = () => { updateSection(section, draft[section]); toast.success("Settings saved"); };
  return <section className="mx-auto max-w-[1200px] space-y-4"><header className="flex items-center gap-3"><div><h1 className="font-sans text-xl font-semibold">Settings</h1><p className="text-sm text-muted-foreground">Manage platform configuration.</p></div></header><Tabs value={section} onValueChange={(value) => setSection(value as SettingsSection)}><TabsList variant="line">{sections.map((item) => <TabsTrigger key={item.value} value={item.value} >{item.label}</TabsTrigger>)}</TabsList></Tabs><div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_15rem]"><Card className="shadow-sm"><CardHeader className="pb-3"><CardTitle>{sections.find((item) => item.value === section)?.label}</CardTitle></CardHeader><CardContent>{section === "integrations" ? <div className="divide-y divide-border">{Object.entries(draft.integrations).map(([key, value]) => <div key={key} className="flex items-center justify-between py-3"><span className="text-sm font-medium">{labels[key] ?? key}</span><span className="text-xs text-muted-foreground">{String(value).replace("-", " ")}</span></div>)}</div> : <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">{Object.entries(current).map(([key, value]) => typeof value === "boolean" ? <div key={key} className="flex min-h-11 items-center justify-between gap-4 border-b border-border py-1 sm:col-span-2"><Label className="font-medium">{labels[key] ?? key}</Label><Switch checked={value} onCheckedChange={(next) => set(key, next)} aria-label={labels[key] ?? key} /></div> : key === "provider" || key === "currency" || key === "timezone" ? <div key={key}><Label>{labels[key] ?? key}</Label><Select value={String(value)} onValueChange={(next) => set(key, next)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{key === "provider" ? <><SelectItem value="razorpay">Razorpay</SelectItem><SelectItem value="none">None</SelectItem></> : <SelectItem value={String(value)}>{String(value)}</SelectItem>}</SelectContent></Select></div> : <div key={key}><Label>{labels[key] ?? key}</Label><Input value={String(value)} onChange={(event) => set(key, event.target.value)} /></div>)}</div>}</CardContent></Card><aside><Card className="shadow-sm"><CardContent className="pt-5"><p className="text-sm text-muted-foreground">Changes apply to this Admin workspace.</p><Button size="sm" disabled={!dirty} className="mt-4 w-full !bg-primary !text-primary-foreground hover:!bg-primary/90" onClick={save}>Save changes</Button></CardContent></Card></aside></div></section>;
}
