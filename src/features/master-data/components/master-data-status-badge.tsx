import { Badge } from "@/components/ui/badge";
import type { MasterDataStatus } from "../types/master-data";

export function MasterDataStatusBadge({ status }: { status: MasterDataStatus }) {
  return status === "active"
    ? <Badge variant="online">Active</Badge>
    : <Badge variant="muted" className="border-error/15 bg-error/8 text-error">Inactive</Badge>;
}
