import { notFound } from "next/navigation";

import { AdminMasterDataEditor } from "@/features/admin/components/master-data/admin-master-data-editor";
import { isUuid } from "@/features/admin/data/admin-list-state";
import { isMasterDataEntity } from "@/features/master-data/constants/master-data-entities";

const single = (value: string | string[] | undefined) => (typeof value === "string" && isUuid(value) ? value : undefined);

export default async function NewMasterDataPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { type } = await params;
  if (!isMasterDataEntity(type)) notFound();
  const query = await searchParams;
  return <AdminMasterDataEditor entity={type} prefill={{ countryId: single(query.countryId), stateId: single(query.stateId) }} />;
}
