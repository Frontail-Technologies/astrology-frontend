import { notFound } from "next/navigation";

import { AdminMasterDataDirectory } from "@/features/admin/components/master-data/admin-master-data-directory";
import { isMasterDataEntity } from "@/features/master-data/constants/master-data-entities";

export default async function MasterDataDirectoryPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!isMasterDataEntity(type)) notFound();
  return <AdminMasterDataDirectory entity={type} />;
}
