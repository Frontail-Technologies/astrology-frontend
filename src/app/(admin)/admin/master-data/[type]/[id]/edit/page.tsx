import { notFound } from "next/navigation";
import { MasterDataEditor } from "@/features/master-data/components/master-data-editor";
import { isMasterDataType } from "@/features/master-data/data/master-data";
export default async function EditMasterDataPage({ params }: { params: Promise<{ type: string; id: string }> }) { const { type, id } = await params; if (!isMasterDataType(type)) notFound(); return <MasterDataEditor type={type} recordId={id} />; }
