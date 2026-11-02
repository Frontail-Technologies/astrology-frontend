"use client";

import { Info } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { emptyConsultationFilters, reportTabLabels, reportTabs, type ReportTab } from "@/features/insights/constants/insights-status";
import { useReportsState } from "@/features/insights/hooks/use-insights-admin";
import { ReportRangeControl } from "./report-controls";
import { ReportsCommerce } from "./reports-commerce";
import { ReportsConsultations } from "./reports-consultations";
import { ReportsContent } from "./reports-content";
import { ReportsCustomers } from "./reports-customers";
import { ReportsOperations } from "./reports-operations";
import { ReportsOverview } from "./reports-overview";

const rangeLabel = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

export function AdminReportsView() {
  const { state, resolved, update } = useReportsState();
  const range = { from: resolved.from, to: resolved.to };

  return (
    <section className="space-y-5">
      <h1 className="sr-only">Reports</h1>
      <Tabs value={state.tab} onValueChange={(value) => update({ tab: value as ReportTab, consultation: emptyConsultationFilters })} className="gap-5">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-border">
          <div className="-mx-4 min-w-0 max-w-[calc(100%+2rem)] overflow-x-auto px-4 sm:mx-0 sm:max-w-full sm:px-0">
            <TabsList variant="line" className="h-11 border-b-0">
              {reportTabs.map((tab) => (
                <TabsTrigger key={tab} value={tab}>
                  {reportTabLabels[tab]}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <div className="flex flex-wrap items-center gap-2 pb-2.5">
            <p className="flex items-center gap-1 text-[13px] text-muted-foreground">
              {rangeLabel.format(new Date(resolved.from))} – {rangeLabel.format(new Date(resolved.to))}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="grid size-6 place-items-center rounded-full outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="How days are counted"
                  >
                    <Info className="size-3.5" aria-hidden="true" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Daily charts group by UTC day (IST − 5:30).</TooltipContent>
              </Tooltip>
            </p>
            <ReportRangeControl value={state.range} onChange={(next) => update({ range: next })} />
          </div>
        </div>

        <TabsContent value="overview">
          <ReportsOverview range={range} granularity={resolved.granularity} />
        </TabsContent>
        <TabsContent value="consultations">
          <ReportsConsultations range={range} filters={state.consultation} onFiltersChange={(consultation) => update({ consultation })} />
        </TabsContent>
        <TabsContent value="commerce">
          <ReportsCommerce range={range} />
        </TabsContent>
        <TabsContent value="customers">
          <ReportsCustomers range={range} />
        </TabsContent>
        <TabsContent value="content">
          <ReportsContent range={range} />
        </TabsContent>
        <TabsContent value="operations">
          <ReportsOperations range={range} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
