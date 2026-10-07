"use client";

import { useSessionImagePreview } from "@/features/admin/hooks/use-session-image-preview";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Link2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bannerRepository } from "@/features/banners/repositories/banner-repository";
import type { Banner, BannerPlacement, BannerStatus } from "@/features/banners/types/banner";

type BannerForm = { title: string; imageSrc: string; linkUrl: string; placement: BannerPlacement; status: BannerStatus; startsAt: string; endsAt: string; sortOrder: string };
const placementLabels: Record<BannerPlacement, string> = { homepage: "Homepage", store: "Store", pooja: "Poojas", consultation: "Consultations" };
const statusLabels: Record<BannerStatus, string> = { active: "Active", draft: "Draft", scheduled: "Scheduled", inactive: "Inactive", expired: "Expired" };
const adminPrimaryClass = "!bg-primary !text-primary-foreground hover:!bg-primary/90";

export function AdminBannerEditor({ banner }: { banner?: Banner }) {
  const router = useRouter();
  const image = useSessionImagePreview({ onReject: (message) => toast.error(message) });
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [form, setForm] = useState<BannerForm>({ title: banner?.title ?? "", imageSrc: banner?.imageSrc ?? "", linkUrl: banner?.linkUrl ?? "", placement: banner?.placement ?? "homepage", status: banner?.status ?? "draft", startsAt: banner?.startsAt ?? "", endsAt: banner?.endsAt ?? "", sortOrder: banner?.sortOrder === undefined ? "" : String(banner.sortOrder) });
  const [preview, setPreview] = useState(form.imageSrc);
  const set = <K extends keyof BannerForm>(key: K, value: BannerForm[K]) => setForm((current) => ({ ...current, [key]: value }));

  const updateImage = (src: string) => {
    set("imageSrc", src);
    setPreview(src);
  };
  const removeImage = () => {
    image.clear();
    updateImage("");
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.imageSrc || (form.startsAt && form.endsAt && form.endsAt < form.startsAt)) return;
    const now = new Date().toISOString();
    const record: Banner = { id: banner?.id ?? `banner-${Date.now()}`, title: form.title || undefined, imageSrc: form.imageSrc, linkUrl: form.linkUrl || undefined, placement: form.placement, status: form.status, startsAt: form.startsAt || undefined, endsAt: form.endsAt || undefined, sortOrder: form.sortOrder === "" ? undefined : Number(form.sortOrder), createdAt: banner?.createdAt ?? now, updatedAt: now };
    if (banner) { await bannerRepository.update(banner.id, record); toast.success("Banner updated"); } else { await bannerRepository.create(record); toast.success("Banner created"); }
    router.push("/admin/banners");
  };

  return <form onSubmit={submit} className="mx-auto max-w-[1360px] space-y-4"><header className="flex flex-wrap items-center justify-between gap-3"><h1 className="font-sans text-xl font-semibold">{banner ? "Edit Banner" : "New Banner"}</h1><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => router.push("/admin/banners")}>Cancel</Button><Button type="submit" size="sm" className={adminPrimaryClass}>{banner ? "Save changes" : "Create Banner"}</Button></div></header><div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.9fr)]"><Card className="border-border/80 shadow-sm"><CardHeader className="pb-3"><CardTitle>Banner media</CardTitle></CardHeader><CardContent className="space-y-3"><div className="aspect-[16/6] max-h-[400px] overflow-hidden rounded-lg border border-dashed border-border bg-muted/30">{preview ? <img src={preview} alt="Banner preview" className="size-full object-cover" /> : <div className="grid size-full place-items-center text-sm text-muted-foreground">Upload a banner image to preview it here.</div>}</div><input ref={image.inputRef} type="file" accept="image/*" className="sr-only" onChange={(event) => { const src = image.handleInputChange(event); if (src) updateImage(src); }} /><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" size="sm" onClick={image.openPicker}><ImagePlus />{preview ? "Replace image" : "Upload image"}</Button>{preview ? <Button type="button" variant="ghost" size="sm" onClick={removeImage}><Trash2 />Remove</Button> : null}<Button type="button" variant="ghost" size="sm" onClick={() => setShowUrlInput((visible) => !visible)}><Link2 />Add from URL</Button></div>{showUrlInput ? <div className="flex gap-2 border-t border-border pt-3"><Input value={form.imageSrc} placeholder="https:// or /assets/..." onChange={(event) => updateImage(event.target.value)} /><Button type="button" size="sm" variant="outline" onClick={() => setShowUrlInput(false)}>Done</Button></div> : null}</CardContent></Card><aside className="lg:sticky lg:top-4"><Card className="border-border/80 shadow-sm"><CardHeader className="pb-3"><CardTitle>Banner settings</CardTitle></CardHeader><CardContent className="space-y-3"><div><Label htmlFor="banner-label">Internal label</Label><Input id="banner-label" value={form.title} onChange={(event) => set("title", event.target.value)} /></div><div><Label>Placement</Label><Select value={form.placement} onValueChange={(value) => set("placement", value as BannerPlacement)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(placementLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div><div><Label htmlFor="banner-link">Link (optional)</Label><Input id="banner-link" value={form.linkUrl} placeholder="/poojas or https://..." onChange={(event) => set("linkUrl", event.target.value)} /></div><div><Label>Status</Label><Select value={form.status} onValueChange={(value) => set("status", value as BannerStatus)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div><div className="grid grid-cols-2 gap-3 border-t border-border pt-3"><div><Label htmlFor="banner-start">Start</Label><Input id="banner-start" type="date" value={form.startsAt} onChange={(event) => set("startsAt", event.target.value)} /></div><div><Label htmlFor="banner-end">End</Label><Input id="banner-end" type="date" value={form.endsAt} onChange={(event) => set("endsAt", event.target.value)} /></div></div><div><Label htmlFor="banner-order">Display order</Label><Input id="banner-order" inputMode="numeric" value={form.sortOrder} onChange={(event) => set("sortOrder", event.target.value)} /></div></CardContent></Card></aside></div></form>;
}
