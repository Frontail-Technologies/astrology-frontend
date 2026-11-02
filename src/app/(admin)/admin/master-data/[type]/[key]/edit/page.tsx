import { notFound } from "next/navigation";

import { AdminMasterDataEditor } from "@/features/admin/components/master-data/admin-master-data-editor";
import { isUuid } from "@/features/admin/data/admin-list-state";
import { isMasterDataEntity } from "@/features/master-data/constants/master-data-entities";
import { consultationModeCodes } from "@/features/master-data/types/master-data-admin";

/** `key` is a UUID, except for consultation modes (`chat` | `voice` | `video`). */
export default async function EditMasterDataPage({ params }: { params: Promise<{ type: string; key: string }> }) {
  const { type, key } = await params;
  if (!isMasterDataEntity(type)) notFound();
  const decoded = decodeURIComponent(key);
  const valid = type === "consultation-modes" ? (consultationModeCodes as readonly string[]).includes(decoded) : isUuid(decoded);
  if (!valid) notFound();
  return <AdminMasterDataEditor entity={type} recordKey={decoded} />;
}
