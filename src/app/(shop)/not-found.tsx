import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export default function ShopNotFound() {
  return (
    <main className="text-foreground">
      <Container className="max-w-2xl py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-conversion-600 dark:text-conversion-500">404</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">We couldn&apos;t find that page</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          The product or collection may have moved or is no longer available.
        </p>
        <Button asChild variant="conversion" className="mt-6">
          <Link href="/shop">Back to the store</Link>
        </Button>
      </Container>
    </main>
  );
}
