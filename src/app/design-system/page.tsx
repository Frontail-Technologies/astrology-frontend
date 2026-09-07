import { ArrowRight, Info, Search, ShieldCheck, Sparkles, X } from "lucide-react";

import { themeSwatches, semanticSwatches } from "@/config/theme";
import { Container } from "@/components/layout/container";
import {
  FormPrimitivePreview,
  InteractivePrimitivePreview
} from "@/app/design-system/primitive-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-background py-10 sm:py-14">
      <Container className="space-y-10">
        <section className="grid gap-4">
          <Badge variant="popular" className="w-fit">
            Foundation Preview - REVIEW
          </Badge>
          <div className="max-w-3xl space-y-3">
            <h1 className="text-4xl leading-tight text-midnight-950 sm:text-5xl">
              Astrology Platform design system
            </h1>
            <p className="text-base leading-7 text-muted-foreground">
              Central tokens and shared primitives for a restrained midnight,
              gold, saffron, and ivory visual foundation.
            </p>
          </div>
        </section>

        <section className="grid gap-4">
          <SectionHeading title="Palette" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[...themeSwatches, ...semanticSwatches].map((swatch) => (
              <div
                className="overflow-hidden rounded-xl border border-border bg-surface"
                key={swatch.token}
              >
                <div className={`h-20 ${swatch.className}`} />
                <div className="space-y-1 p-4">
                  <p className="text-sm font-semibold">{swatch.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{swatch.token}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4">
          <SectionHeading title="Typography" />
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <Card>
              <CardHeader>
                <CardTitle>Display</CardTitle>
                <CardDescription>Cormorant Garamond via next/font</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-display text-5xl leading-[0.95] text-midnight-950 sm:text-6xl">
                  Ancient astrology, thoughtfully explained
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Page hierarchy</CardTitle>
                <CardDescription>Inter for dense UI; serif reserved for display.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    Page H1
                  </p>
                  <p className="font-display text-4xl leading-tight text-midnight-950">
                    Birth chart overview
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    Section heading
                  </p>
                  <p className="font-sans text-xl font-semibold text-foreground">
                    Birth details
                  </p>
                </div>
                <p className="text-base leading-7 text-muted-foreground">
                  Clean body text supports forms, reports, listings, dashboards,
                  and admin surfaces without decorative overload.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-4">
          <SectionHeading title="Buttons" />
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button className="justify-between" variant="conversion">
              <Sparkles aria-hidden="true" />
              Generate Kundli
              <span className="ml-1 text-xs font-medium opacity-75">conversion</span>
            </Button>
            <Button className="justify-between">
              Explore Horoscope
              <span className="ml-1 text-xs font-medium opacity-75">default</span>
            </Button>
            <Button className="justify-between" variant="discovery">
              View Details
              <span className="ml-1 text-xs font-medium opacity-75">discovery</span>
            </Button>
            <Button className="justify-between" variant="outline">
              Cancel
              <span className="ml-1 text-xs font-medium opacity-70">outline</span>
            </Button>
            <Button variant="ghost">Edit profile</Button>
            <Button variant="destructive">
              <X aria-hidden="true" />
              Remove
            </Button>
            <Button aria-label="Search" size="icon" variant="outline">
              <Search aria-hidden="true" />
            </Button>
          </div>
        </section>

        <section className="grid gap-4">
          <SectionHeading title="Inputs" />
          <FormPrimitivePreview />
        </section>

        <section className="grid gap-4">
          <SectionHeading title="Surfaces" />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="dark-surface relative overflow-hidden rounded-2xl border p-6">
              <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full border border-gold-400/15" />
              <div className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full border border-gold-400/10" />
              <div className="relative mb-5 flex items-center gap-3">
                <Sparkles aria-hidden="true" className="size-5 text-gold-400" />
                <h3 className="font-sans text-lg font-semibold">Premium dark surface</h3>
              </div>
              <p className="relative max-w-xl text-sm leading-6 text-[var(--text-dark-secondary)]">
                Reserved for navigation, hero moments, selected report framing, and
                astrology-specific visual emphasis.
              </p>
            </div>
            <div className="light-surface rounded-2xl border border-border p-6">
              <div className="mb-5 flex items-center gap-3">
                <ShieldCheck aria-hidden="true" className="size-5 text-midnight-800" />
                <h3 className="font-sans text-lg font-semibold">Readable light surface</h3>
              </div>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                Intended for data-heavy forms, long reports, listings, dashboards,
                and operational workflows.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface-muted p-6">
              <div className="mb-5 flex items-center gap-3">
                <Info aria-hidden="true" className="size-5 text-midnight-800" />
                <h3 className="font-sans text-lg font-semibold">Muted information surface</h3>
              </div>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                Useful for supporting guidance, empty states, help text, and
                non-critical status panels.
              </p>
            </div>
            <div className="rounded-2xl border border-gold-500/35 bg-gold-300/10 p-6">
              <div className="mb-5 flex items-center gap-3">
                <ArrowRight aria-hidden="true" className="size-5 text-gold-500" />
                <h3 className="font-sans text-lg font-semibold">Selectable surface</h3>
              </div>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                A restrained selected state for cards and choices without turning
                every component into a gold outline.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          <SectionHeading title="Celestial Detail" />
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Thin divider</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-500/55 to-transparent" />
                  <Sparkles aria-hidden="true" className="size-4 text-gold-500" />
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-500/55 to-transparent" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tiny constellation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-14">
                  <span className="absolute left-2 top-8 size-1.5 rounded-full bg-gold-500" />
                  <span className="absolute left-16 top-3 size-1 rounded-full bg-gold-400" />
                  <span className="absolute left-28 top-9 size-1.5 rounded-full bg-gold-500" />
                  <span className="absolute left-3 top-7 h-px w-16 rotate-[-26deg] bg-gold-400/35" />
                  <span className="absolute left-16 top-5 h-px w-14 rotate-[23deg] bg-gold-400/35" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Ring fragment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-14 overflow-hidden">
                  <span className="absolute -left-8 top-1 size-20 rounded-full border border-gold-500/35" />
                  <span className="absolute -left-4 top-5 size-12 rounded-full border border-gold-400/20" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-4">
          <SectionHeading title="Primitives" />
          <InteractivePrimitivePreview />
        </section>
      </Container>
    </main>
  );
}

function SectionHeading({ title }: { title: string }) {
  return <h2 className="font-sans text-xl font-semibold text-midnight-950">{title}</h2>;
}
