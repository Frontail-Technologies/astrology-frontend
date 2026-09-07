"use client"

import { Calendar, Clock, MapPin, Search, ShieldCheck, UserRound } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const astrologySystemSelect = {
  value: "vedic-astrology",
  label: "Vedic Astrology"
} as const

const sortSelect = {
  value: "fees-low-high",
  label: "Fees: Low to High"
} as const

const longLabelPreview = {
  value: "long-label-preview",
  label: "Long label: Language, expertise, availability, and price combined"
} as const

export function FormPrimitivePreview() {
  return (
    <div className="grid gap-4 rounded-2xl border border-border bg-surface p-5 md:grid-cols-2 lg:grid-cols-4">
      <div className="grid gap-2">
        <Label htmlFor="preview-name">Name</Label>
        <Input id="preview-name" placeholder="Ananya Sharma" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="preview-date">Date of Birth</Label>
        <div className="relative">
          <Calendar
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input id="preview-date" className="pl-9" type="date" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="preview-time">Time of Birth</Label>
        <div className="relative">
          <Clock
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input id="preview-time" className="pl-9" type="time" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="preview-place">Birth Place</Label>
        <div className="relative">
          <MapPin
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="preview-place"
            className="pl-9"
            placeholder="New Delhi, India"
          />
        </div>
      </div>
      <div className="grid gap-2 md:col-span-1 lg:col-span-2">
        <Label>Astrology system</Label>
        <Select value={astrologySystemSelect.value}>
          <SelectTrigger aria-label="Astrology system" data-testid="system-select-trigger">
            <SelectValue placeholder="Select astrology system" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value={astrologySystemSelect.value}>
              {astrologySystemSelect.label}
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          machine: {astrologySystemSelect.value} - trigger: {astrologySystemSelect.label}
        </p>
      </div>
      <div className="grid gap-2 md:col-span-1 lg:col-span-2">
        <Label>Sort</Label>
        <Select value={sortSelect.value}>
          <SelectTrigger aria-label="Sort order" data-testid="controlled-select-trigger">
            <SelectValue placeholder="Select sort order" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value={sortSelect.value}>
              {sortSelect.label}
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          machine: {sortSelect.value} - trigger: {sortSelect.label}
        </p>
      </div>
      <div className="grid gap-2 lg:col-span-2">
        <Label>Placeholder select</Label>
        <Select>
          <SelectTrigger aria-label="Placeholder select" data-testid="placeholder-select-trigger">
            <SelectValue placeholder="Choose a display density" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="comfortable">Comfortable</SelectItem>
            <SelectItem value="compact">Compact</SelectItem>
            <SelectItem value={longLabelPreview.value}>
              {longLabelPreview.label}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2 lg:col-span-2">
        <Label>Disabled select</Label>
        <Select disabled>
          <SelectTrigger aria-label="Disabled select">
            <SelectValue placeholder="Unavailable" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="disabled">Unavailable</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export function InteractivePrimitivePreview() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Tabs and accordion</CardTitle>
          <CardDescription>Radix behavior with local styling.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tokens">
            <TabsList>
              <TabsTrigger value="tokens" data-testid="tabs-tokens">
                Tokens
              </TabsTrigger>
              <TabsTrigger value="forms" data-testid="tabs-forms">
                Forms
              </TabsTrigger>
            </TabsList>
            <TabsContent value="tokens" className="mt-4">
              <Accordion type="multiple" defaultValue={["color"]}>
                <AccordionItem value="color">
                  <AccordionTrigger data-testid="accordion-color-trigger">
                    Color semantics
                  </AccordionTrigger>
                  <AccordionContent>
                    Gold is for detail and premium emphasis. Saffron is for
                    committed conversion actions.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="surfaces">
                  <AccordionTrigger data-testid="accordion-surfaces-trigger">
                    Surface strategy
                  </AccordionTrigger>
                  <AccordionContent>
                    Dark surfaces are contextual. Light surfaces remain available
                    for dense content and workflows.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
            <TabsContent value="forms" className="mt-4">
              <div
                className="flex items-center gap-3 rounded-xl bg-surface-muted p-4 text-sm text-muted-foreground"
                data-testid="tabs-forms-panel"
              >
                <Calendar aria-hidden="true" className="size-4" />
                Form controls use clear labels and mobile-friendly touch targets.
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Overlays and states</CardTitle>
          <CardDescription>Dialog, sheet, badge, icon, separator, skeleton.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="verified">Verified</Badge>
            <Badge variant="online">Online</Badge>
            <Badge variant="popular">Popular</Badge>
            <Badge variant="pending">Pending</Badge>
            <Badge variant="unavailable">Unavailable</Badge>
          </div>
          <Separator />
          <div className="flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger
                className="inline-flex min-h-11 items-center justify-center rounded-[calc(var(--radius)-2px)] border border-border px-4 py-2 text-sm font-semibold"
                data-testid="dialog-trigger"
              >
                Dialog
              </DialogTrigger>
              <DialogContent data-testid="dialog-content">
                <DialogHeader>
                  <DialogTitle>Dialog primitive</DialogTitle>
                  <DialogDescription>
                    Accessible modal behavior from Radix UI.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="conversion">Confirm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Sheet>
              <SheetTrigger
                className="inline-flex min-h-11 items-center justify-center rounded-[calc(var(--radius)-2px)] border border-border px-4 py-2 text-sm font-semibold"
                data-testid="sheet-trigger"
              >
                Sheet
              </SheetTrigger>
              <SheetContent data-testid="sheet-content">
                <SheetHeader>
                  <SheetTitle>Sheet primitive</SheetTitle>
                  <SheetDescription>
                    Responsive side-panel behavior for focused secondary tasks.
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </div>
          <div className="grid gap-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex gap-2 text-muted-foreground">
            <UserRound aria-label="Account icon" className="size-5" />
            <Search aria-label="Search icon" className="size-5" />
            <ShieldCheck aria-label="Trust icon" className="size-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
