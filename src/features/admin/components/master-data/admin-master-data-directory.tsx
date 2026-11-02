"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Database, ListTree, Lock, Pencil, Plus } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { Button } from "@/components/ui/button";
import {
  consultationModeLabel,
  masterDataActiveLabels,
  masterDataChild,
  masterDataKey,
  masterDataMeta,
  masterDataParent,
  textDirectionLabels,
} from "@/features/master-data/constants/master-data-entities";
import { useMasterDataDetail, useMasterDataList, useMasterDataOptions } from "@/features/master-data/hooks/use-master-data-admin";
import { missingConsultationModes } from "@/features/master-data/lib/master-data-payload";
import type { AdminMasterDataRecord, MasterDataEntity } from "@/features/master-data/types/master-data-admin";
import { mediaDisplayUrl } from "@/features/media/media-url";
import { ActivePill, CatalogMobileCard, MarkerPill } from "../catalog/catalog-pills";
import { AdminRowActionLink } from "../shared/admin-row-action-link";
import { AdminRowActions, type AdminRowAction } from "../shared/admin-row-actions";
import { AdminServerList } from "../shared/admin-server-list";
import { useMasterDataStatusConfirm } from "./master-data-status-toggle";
import { MasterDataSubnav } from "./master-data-subnav";
import { consultationModeIcons } from "./master-data-visuals";

function ModeIcon({ code }: { code: string | null }) {
  const Icon = consultationModeIcons[code ?? ""] ?? consultationModeIcons.chat;
  return <Icon className="size-4" aria-hidden="true" />;
}

export function MasterDataStatusBadge({ active }: { active: boolean }) {
  return <ActivePill active={active} />;
}

const editHref = (entity: MasterDataEntity, record: AdminMasterDataRecord) => `/admin/master-data/${entity}/${encodeURIComponent(masterDataKey(entity, record))}/edit`;

function Code({ value }: { value: string | null | undefined }) {
  return value ? <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{value}</span> : <span className="text-muted-foreground">—</span>;
}

function usageText(entity: MasterDataEntity, record: AdminMasterDataRecord) {
  const noun = masterDataMeta[entity].usageNoun;
  if (!noun) return "";
  return `${record.usageCount} ${noun}`;
}

/** Secondary line under the name (code, slug or native name). */
function subtitle(entity: MasterDataEntity, record: AdminMasterDataRecord) {
  if (entity === "languages") return [record.nativeName, record.code].filter(Boolean).join(" · ");
  if (entity === "consultation-modes") return consultationModeLabel(record.code);
  return record.slug ?? "";
}

function NameCell({ entity, record }: { entity: MasterDataEntity; record: AdminMasterDataRecord }) {
  const image = entity === "expertise" ? mediaDisplayUrl(record.imageUrl) : null;
  return (
    <div className="flex min-w-44 items-center gap-2.5">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of an uploaded/external image
        <img src={image} alt="" className="size-8 shrink-0 rounded-md border border-border object-cover" />
      ) : entity === "consultation-modes" ? (
        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
          <ModeIcon code={record.code} />
        </span>
      ) : null}
      <div className="min-w-0">
        <Link href={editHref(entity, record)} className="font-medium text-foreground hover:underline">
          {record.name}
        </Link>
        <p className="truncate text-xs text-muted-foreground">{subtitle(entity, record)}</p>
      </div>
      {record.isDefault ? <MarkerPill>Default</MarkerPill> : null}
      {record.protected ? (
        <span title="Built-in mode (cannot be deleted)">
          <Lock className="size-3.5 text-muted-foreground" aria-label="Built-in" />
        </span>
      ) : null}
    </div>
  );
}

function RowActions({ entity, record }: { entity: MasterDataEntity; record: AdminMasterDataRecord }) {
  const child = masterDataChild[entity];
  const key = masterDataKey(entity, record);
  const toggle = useMasterDataStatusConfirm({ entity, recordKey: key, name: record.name, active: record.active });
  const actions: AdminRowAction[] = [
    ...(child && record.id ? [{ label: `View ${masterDataMeta[child.entity].plural.toLowerCase()}`, icon: ListTree, href: `/admin/master-data/${child.entity}?${child.param}=${record.id}` }] : []),
    { label: toggle.label, icon: toggle.icon, onSelect: toggle.open, disabled: toggle.pending, destructive: record.active, separatorBefore: Boolean(child && record.id) },
  ];
  return (
    <div className="flex items-center justify-end gap-0.5">
      <AdminRowActionLink href={editHref(entity, record)} label={`Edit ${record.name}`} icon={Pencil} />
      <AdminRowActions label={`More actions for ${record.name}`} actions={actions} />
      {toggle.dialog}
    </div>
  );
}

/** Parent name lookup for states (countries) and cities (states): first 100 parents, falls back to a short id. */
function useParentNames(entity: MasterDataEntity) {
  const parent = masterDataParent[entity];
  const options = useMasterDataOptions(parent?.entity ?? "countries", Boolean(parent));
  return useMemo(() => new Map(options.items.map((item) => [item.id ?? "", item.name])), [options.items]);
}

function ParentContext({ entity, parentId }: { entity: MasterDataEntity; parentId: string | undefined }) {
  const parent = masterDataParent[entity];
  const detail = useMasterDataDetail(parent?.entity ?? "countries", parent && parentId ? parentId : null);
  if (!parent || !parentId) return null;
  return (
    <p className="text-sm text-muted-foreground">
      Showing {masterDataMeta[entity].plural.toLowerCase()} in{" "}
      {detail.data ? (
        <Link href={editHref(parent.entity, detail.data)} className="font-medium text-foreground hover:underline">
          {detail.data.name}
        </Link>
      ) : detail.error ? (
        <span className="font-medium text-foreground">an unknown {parent.label.toLowerCase()}</span>
      ) : (
        "…"
      )}
      .
    </p>
  );
}

export function AdminMasterDataDirectory({ entity }: { entity: MasterDataEntity }) {
  const list = useMasterDataList(entity);
  const meta = masterDataMeta[entity];
  const parent = masterDataParent[entity];
  const parentId = parent ? list.state.ids?.[parent.param] : undefined;
  const parentNames = useParentNames(entity);
  const modes = useMasterDataOptions("consultation-modes", entity === "consultation-modes");
  const missingModes = entity === "consultation-modes" ? missingConsultationModes(modes.items.map((item) => item.code)) : [];
  const canCreate = entity !== "consultation-modes" || (modes.data !== null && missingModes.length > 0);
  const newHref = `/admin/master-data/${entity}/new${parent && parentId ? `?${parent.param}=${parentId}` : ""}`;
  const newButton = canCreate ? (
    <Button asChild variant="conversion" size="sm">
      <Link href={newHref}>
        <Plus aria-hidden="true" />
        New {meta.singular.toLowerCase()}
      </Link>
    </Button>
  ) : null;

  const columns = useMemo<ColumnDef<AdminMasterDataRecord>[]>(() => {
    const parentName = (id: string | null) => (id ? (parentNames.get(id) ?? "Not in the first 100") : "—");
    const name: ColumnDef<AdminMasterDataRecord> = {
      id: "name",
      header: "Name",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => <NameCell entity={entity} record={row.original} />,
    };
    const specific: ColumnDef<AdminMasterDataRecord>[] = [];
    if (entity === "languages") {
      specific.push({ id: "code", header: "Code", enableSorting: false, cell: ({ row }) => <Code value={row.original.code} /> });
      specific.push({ id: "direction", header: "Direction", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm text-muted-foreground">{textDirectionLabels[row.original.direction ?? "ltr"]}</span> });
    }
    if (entity === "countries") {
      specific.push({ id: "code", header: "Code", enableSorting: false, cell: ({ row }) => <Code value={row.original.code} /> });
      specific.push({ id: "phoneCode", header: "Dialling code", enableSorting: false, cell: ({ row }) => <span className="text-sm tabular-nums">{row.original.phoneCode ?? "—"}</span> });
    }
    if (entity === "states") {
      specific.push({ id: "code", header: "Code", enableSorting: false, cell: ({ row }) => <Code value={row.original.code} /> });
      specific.push({ id: "country", header: "Country", enableSorting: false, cell: ({ row }) => <span className="text-sm">{parentName(row.original.countryId)}</span> });
    }
    if (entity === "cities") {
      specific.push({ id: "state", header: "State", enableSorting: false, cell: ({ row }) => <span className="text-sm">{parentName(row.original.stateId)}</span> });
    }
    if (entity === "pooja-categories") {
      specific.push({ id: "technicalKey", header: "Technical key", enableSorting: false, cell: ({ row }) => <Code value={row.original.technicalKey} /> });
    }
    if (entity === "expertise" || entity === "specialties" || entity === "tags" || entity === "pooja-categories") {
      specific.push({
        id: "description",
        header: "Description",
        enableSorting: false,
        cell: ({ row }) => <span className="block max-w-72 truncate text-xs text-muted-foreground">{row.original.description ?? "—"}</span>,
      });
    }
    return [
      name,
      ...specific,
      { id: "status", header: "Status", enableSorting: false, cell: ({ row }) => <MasterDataStatusBadge active={row.original.active} /> },
      ...(meta.usageNoun
        ? [{ id: "usage", header: "Used by", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">{usageText(entity, row.original)}</span> } satisfies ColumnDef<AdminMasterDataRecord>]
        : []),
      { id: "sortOrder", header: "Order", enableSorting: false, cell: ({ row }) => <span className="text-sm tabular-nums text-muted-foreground">{row.original.sortOrder}</span> },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => <RowActions entity={entity} record={row.original} />,
      },
    ];
  }, [entity, meta.usageNoun, parentNames]);

  return (
    <AdminServerList
      title={meta.plural}
      description={meta.description}
      noun={meta.plural.toLowerCase()}
      primaryAction={newButton}
      summary={
        <div className="space-y-2">
          <MasterDataSubnav entity={entity} />
          <ParentContext entity={entity} parentId={parentId} />
          {entity === "consultation-modes" ? (
            <p className="text-[13px] text-muted-foreground">Chat, voice and video are built in: they can be renamed, reordered or deactivated, but not deleted.</p>
          ) : null}
        </div>
      }
      list={list}
      columns={columns}
      searchPlaceholder={`Search ${meta.plural.toLowerCase()} by name…`}
      filters={[{ key: "active", allLabel: "All statuses", options: masterDataActiveLabels }]}
      idFilterLabels={{ countryId: "Country", stateId: "State" }}
      idFilterName={(key, rows) => {
        const parentId = key === "countryId" ? rows[0]?.countryId : rows[0]?.stateId;
        return parentId ? parentNames.get(parentId) : null;
      }}
      initialColumnVisibility={{ sortOrder: false, description: false }}
      emptyLabel={`No ${meta.plural.toLowerCase()} yet`}
      emptyDescription={canCreate ? `Add the first ${meta.singular.toLowerCase()} to use it in pickers.` : undefined}
      emptyIcon={Database}
      emptyAction={newButton}
      renderMobileCard={(record) => (
        <CatalogMobileCard key={masterDataKey(entity, record)}>
            <div className="flex items-start justify-between gap-3">
              <NameCell entity={entity} record={record} />
              <RowActions entity={entity} record={record} />
            </div>
            <MasterDataStatusBadge active={record.active} />
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {meta.usageNoun ? <span>Used by {usageText(entity, record)}</span> : null}
              {entity === "states" ? <span>{record.countryId ? (parentNames.get(record.countryId) ?? "Country") : ""}</span> : null}
              {entity === "cities" ? <span>{record.stateId ? (parentNames.get(record.stateId) ?? "State") : ""}</span> : null}
              {entity === "countries" && record.phoneCode ? <span>{record.phoneCode}</span> : null}
            </div>
        </CatalogMobileCard>
      )}
    />
  );
}
