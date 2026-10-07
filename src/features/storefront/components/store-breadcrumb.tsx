import { ChevronRight } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function StoreBreadcrumb({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <BreadcrumbItem key={`${item.label}-${index}`}>
            {item.href ? <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink> : <BreadcrumbPage>{item.label}</BreadcrumbPage>}
            {index < items.length - 1 ? (
              <BreadcrumbSeparator>
                <ChevronRight />
              </BreadcrumbSeparator>
            ) : null}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
