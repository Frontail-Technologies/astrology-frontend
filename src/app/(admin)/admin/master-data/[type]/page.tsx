import { notFound } from "next/navigation";
import { MasterDataDirectory } from "@/features/master-data/components/master-data-directory";
import { isMasterDataType } from "@/features/master-data/data/master-data";
export default async function MasterDataDirectoryPage({ params }: { params: Promise<{ type: string }> }) { const { type } = await params; if (!isMasterDataType(type)) notFound(); return <MasterDataDirectory type={type} />; }
