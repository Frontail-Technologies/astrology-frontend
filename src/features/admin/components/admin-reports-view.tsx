"use client";

import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { defaultRangeState, resolveRange, type RangeState } from "../insights/date-range";
import { useInsightsData } from "../insights/use-insights-data";
import { ReportRangeControl } from "./reports/report-controls";
import { ReportsCommerce } from "./reports/reports-commerce";
import { ReportsConsultations } from "./reports/reports-consultations";
import { ReportsContent } from "./reports/reports-content";
import { ReportsCustomers } from "./reports/reports-customers";
import { ReportsOverview } from "./reports/reports-overview";

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "consultations", label: "Consultations" },
  { value: "commerce", label: "Commerce" },
  { value: "customers", label: "Customers" },
  { value: "content", label: "Content" },
] as const;

const rangeLabel = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

export function AdminReportsView() {
  const { snapshot } = useInsightsData();
  const [rangeState, setRangeState] = useState<RangeState>(defaultRangeState);
  const [tab, setTab] = useState<(typeof tabs)[number]["value"]>("overview");

  const range = snapshot ? resolveRange(rangeState, snapshot.now) : null;
  const incompleteCustom =
    rangeState.preset === "custom" && (!rangeState.customFrom || !rangeState.customTo);

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div>
          <h1 className="font-sans text-xl font-semibold tracking-tight text-foreground">Reports</h1>
          {range ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {rangeLabel.format(range.from)} – {rangeLabel.format(range.to)}
              {incompleteCustom ? " · choose both dates to apply a custom range" : ""}
            </p>
          ) : null}
        </div>
        <ReportRangeControl value={rangeState} onChange={setRangeState} />
      </header>

      <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
        <TabsList variant="line">
          {tabs.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {snapshot && range ? (
          <>
            <TabsContent value="overview"><ReportsOverview snapshot={snapshot} range={range} /></TabsContent>
            <TabsContent value="consultations"><ReportsConsultations snapshot={snapshot} range={range} /></TabsContent>
            <TabsContent value="commerce"><ReportsCommerce snapshot={snapshot} range={range} /></TabsContent>
            <TabsContent value="customers"><ReportsCustomers snapshot={snapshot} range={range} /></TabsContent>
            <TabsContent value="content"><ReportsContent snapshot={snapshot} range={range} /></TabsContent>
          </>
        ) : (
          <div className="space-y-4" aria-busy="true" aria-label="Loading reports">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-[84px] rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-48 rounded-xl" />
          </div>
        )}
      </Tabs>
    </section>
  );
}
